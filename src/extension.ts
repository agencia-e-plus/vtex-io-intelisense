import * as vscode from 'vscode'
import {
	findDuplicatedBlocks,
	// findDuplicatedBlocks,
	refreshDiagnostics,
	subscribeToDocumentChanges
} from './diagnostics'

export function activate(context: vscode.ExtensionContext) {
	const blocksDiagnostics = vscode.languages.createDiagnosticCollection('blocks')
	const duplicatedBlocksDiagnostics =
		vscode.languages.createDiagnosticCollection('duplicatedBlocks')

	const command = vscode.commands.registerCommand('vtexiointellisense.findUnusedBlocks', () => {
		if (!vscode.window.activeTextEditor) {
			return
		}
		refreshDiagnostics(blocksDiagnostics)
	})

	vscode.commands.registerCommand('vtexiointellisense.findDuplicatedBlocks', () => {
		if (!vscode.window.activeTextEditor) {
			return
		}
		findDuplicatedBlocks(duplicatedBlocksDiagnostics)
	})

	context.subscriptions.push(blocksDiagnostics)

	subscribeToDocumentChanges(context, blocksDiagnostics, duplicatedBlocksDiagnostics)
}
