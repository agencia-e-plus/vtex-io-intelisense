import * as vscode from 'vscode'

export function createDiagnostic(
	lineOfText: vscode.TextLine,
	lineIndex: number,
	word: string,
	diagnosticType: string
): vscode.Diagnostic {
	const index = lineOfText.text.indexOf(word)

	// create range that represents, where in the document the word is

	const range = new vscode.Range(lineIndex, index, lineIndex, index + word.length)

	const diagnostic = new vscode.Diagnostic(range, diagnosticType, vscode.DiagnosticSeverity.Warning)

	diagnostic.code = diagnosticType

	return diagnostic
}
