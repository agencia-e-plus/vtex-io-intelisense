import * as vscode from "vscode"
import {
	// findDuplicatedBlocks,
	refreshDiagnostics,
	subscribeToDocumentChanges
} from "./diagnostics"

export function activate(context: vscode.ExtensionContext) {
	const blocksDiagnostics =
		vscode.languages.createDiagnosticCollection("blocks")
	const command = vscode.commands.registerCommand(
		"vtexiointellisense.findUnusedBlocks",
		() => {
			if (!vscode.window.activeTextEditor) {
				return
			}
			refreshDiagnostics(
				// vscode.window.activeTextEditor.document,
				blocksDiagnostics
			)
		}
	)

	// vscode.commands.registerCommand(
	// 	"vtexiointellisense.findDuplicatedBlocks",
	// 	() => {
	// 		if (!vscode.window.activeTextEditor) {
	// 			return
	// 		}
	// 		findDuplicatedBlocks(
	// 			// vscode.window.activeTextEditor.document,
	// 			blocksDiagnostics
	// 		)
	// 	}
	// )

	context.subscriptions.push(blocksDiagnostics)

	// subscribeToDocumentChanges(context, blocksDiagnostics)
}
