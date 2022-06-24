import { parse } from 'jsonc-parser'
import * as vscode from 'vscode'
import { IJSONFile } from './getFiles'

export const updateFiles = (doc: vscode.TextDocument, jsonFiles: IJSONFile[]) => {
	const docPath = doc.uri.fsPath.replace('/', '')
	const textContent = doc.getText()

	if (textContent && textContent != '') {
		const content = parse(textContent)

		if (!jsonFiles.find((file) => file.filePath === docPath)) {
			jsonFiles.push({ filePath: docPath, content })
		} else {
			jsonFiles.forEach((file) => {
				if (file.filePath === docPath) {
					file.content = content
				}
			})
		}
	}

	const allJSONsUpdated = jsonFiles.reduce(
		(acc, file: { content: Record<string, BlockItem> }) => ({ ...acc, ...file.content }),
		{}
	)

	return allJSONsUpdated
}
