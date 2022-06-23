import * as vscode from 'vscode'
import { glob } from 'glob'
import { findDocumentDuplicatedBlocks } from './duplicated_blocks'
import { refreshDocumentDiagnostics } from './unused_blocks'
import { getFiles } from './utils/getFiles'
import { updateFiles } from './utils/updateFiles'

/** Code that is used to associate diagnostic entries with code actions. */

export function subscribeToDocumentChanges(
	context: vscode.ExtensionContext,
	blocksDiagnostics: vscode.DiagnosticCollection,
	duplicatedBlocksDiagnostics: vscode.DiagnosticCollection
): void {
	const configs = vscode.workspace.getConfiguration('vtexiointellisense')

	const [folder] = vscode?.workspace?.workspaceFolders || ([] as vscode.WorkspaceFolder[])

	const checkFolderPath = glob.sync(`${folder?.uri?.fsPath}/**/store/blocks`)[0]

	const { jsonFiles } = getFiles()

	if (vscode.window.activeTextEditor) {
		const document = vscode.window.activeTextEditor.document
		const allJSONsUpdated = updateFiles(document, jsonFiles)
		const documentPath = document.uri.fsPath.replace(/\\/g, '/')

		if (!documentPath.startsWith(checkFolderPath)) return
		configs.get('unusedBlocks') &&
			refreshDocumentDiagnostics(document, allJSONsUpdated, blocksDiagnostics)
		configs.get('duplicatedBlocks') &&
			findDocumentDuplicatedBlocks(document, jsonFiles, duplicatedBlocksDiagnostics)
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				const document = editor.document
				const documentPath = document.uri.fsPath.replace(/\\/g, '/')

				if (!documentPath.startsWith(checkFolderPath)) return

				const allJSONsUpdated = updateFiles(document, jsonFiles)

				configs.get('unusedBlocks') &&
					refreshDocumentDiagnostics(document, allJSONsUpdated, blocksDiagnostics)
				configs.get('duplicatedBlocks') &&
					findDocumentDuplicatedBlocks(document, jsonFiles, duplicatedBlocksDiagnostics)
			}
		})
	)

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((doc) => {
			const allJSONsUpdated = updateFiles(doc, jsonFiles)

			const documentPath = doc.uri.fsPath.replace(/\\/g, '/')

			if (!documentPath.startsWith(checkFolderPath)) return

			configs.get('unusedBlocks') &&
				refreshDocumentDiagnostics(doc, allJSONsUpdated, blocksDiagnostics)
			configs.get('duplicatedBlocks') &&
				findDocumentDuplicatedBlocks(doc, jsonFiles, duplicatedBlocksDiagnostics)
		})
	)

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument((doc) => blocksDiagnostics.delete(doc.uri))
	)
}
