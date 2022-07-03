import * as vscode from 'vscode'

export function createDiagnostic({
	lineOfText,
	lineIndex,
	word,
	message,
	diagnosticType,
	documents
}: {
	lineOfText: vscode.TextLine
	lineIndex: number
	word: string
	message: string
	diagnosticType: string
	documents?: vscode.TextDocument[]
}): vscode.Diagnostic {
	const index = lineOfText.text.indexOf(word)

	// create range that represents, where in the document the word is

	const range = new vscode.Range(lineIndex, index, lineIndex, index + word.length)

	const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Warning)

	diagnostic.source = 'VTEX IO Intellissense'
	diagnostic.code = diagnosticType
	if (documents) {
		diagnostic.relatedInformation = documents.map(
			(document) =>
				new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, range), 'used In')
		)
	}

	return diagnostic
}
