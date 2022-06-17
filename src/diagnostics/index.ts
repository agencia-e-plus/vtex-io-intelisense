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

	const files = glob.sync(folder?.uri?.fsPath + '/**/store/blocks/**/*.{json,jsonc}')

	const { allJSONs, jsonFiles } = getFiles()

	if (vscode.window.activeTextEditor) {
		const document = vscode.window.activeTextEditor.document
		const allJSONsUpdated = updateFiles(document, jsonFiles)

		refreshDocumentDiagnostics(document, allJSONsUpdated, blocksDiagnostics)
		configs.get('duplicatedBlocks') &&
			findDocumentDuplicatedBlocks(document, jsonFiles, duplicatedBlocksDiagnostics)
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				const document = editor.document
				const allJSONsUpdated = updateFiles(document, jsonFiles)

				refreshDocumentDiagnostics(document, allJSONsUpdated, blocksDiagnostics)
				configs.get('duplicatedBlocks') &&
					findDocumentDuplicatedBlocks(document, jsonFiles, duplicatedBlocksDiagnostics)
			}
		})
	)

	// context.subscriptions.push(
	// 	vscode.workspace.onDidChangeTextDocument((e) =>
	// 		refreshDocumentDiagnostics(e.document, allJSONs, blocksDiagnostics)
	// 	)
	// )

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((doc) => {
			const allJSONsUpdated = updateFiles(doc, jsonFiles)

			refreshDocumentDiagnostics(doc, allJSONsUpdated, blocksDiagnostics)
			configs.get('duplicatedBlocks') &&
				findDocumentDuplicatedBlocks(doc, jsonFiles, duplicatedBlocksDiagnostics)
		})
	)

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument((doc) => blocksDiagnostics.delete(doc.uri))
	)
}
