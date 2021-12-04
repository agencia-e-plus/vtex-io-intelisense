import * as vscode from 'vscode';
import { subscribeToDocumentChanges } from './diagnostics';


export function activate(context: vscode.ExtensionContext) {
	const blocksDiagnostics = vscode.languages.createDiagnosticCollection("blocks");
	context.subscriptions.push(blocksDiagnostics);

	subscribeToDocumentChanges(context, blocksDiagnostics);
}
