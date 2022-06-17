import { parse } from 'jsonc-parser'
import * as vscode from 'vscode'

export const updateFiles = (doc: vscode.TextDocument, jsonFiles: any[]) => {
	jsonFiles.forEach((file) => {
		if (file.filePath === doc.uri.path.replace('/', '')) {
			const content = doc.getText()
			file.content = parse(content)
		}
	})

	const allJSONsUpdated = jsonFiles.reduce(
		(acc, file: { content: Record<string, unknown> }) => ({ ...acc, ...file.content }),
		{}
	)

	return allJSONsUpdated
}
