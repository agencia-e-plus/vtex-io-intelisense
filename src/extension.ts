import * as vscode from 'vscode'
import { subscribeToDocumentChanges } from './diagnostics'
import { findDuplicatedBlocks } from './diagnostics/duplicated_blocks'
import { refreshDiagnostics } from './diagnostics/unused_blocks'

export function activate(context: vscode.ExtensionContext) {
	const blocksDiagnostics = vscode.languages.createDiagnosticCollection('blocks')
	const duplicatedBlocksDiagnostics =
		vscode.languages.createDiagnosticCollection('duplicatedBlocks')

	vscode.commands.registerCommand('vtexiointellisense.storeLint', async () => {
		if (!vscode.window.activeTextEditor) {
			return
		}

		await vscode.window.showInformationMessage('Linting store')
		refreshDiagnostics(blocksDiagnostics)
		findDuplicatedBlocks(duplicatedBlocksDiagnostics)
		vscode.window.showInformationMessage('Lint Finished')
	})

	context.subscriptions.push(blocksDiagnostics)

	subscribeToDocumentChanges(context, blocksDiagnostics, duplicatedBlocksDiagnostics)
}
