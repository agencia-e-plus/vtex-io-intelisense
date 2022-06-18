import { parse } from 'jsonc-parser'
import * as vscode from 'vscode'
import { IJSONFile } from './getFiles'

export const updateFiles = (doc: vscode.TextDocument, jsonFiles: IJSONFile[]) => {
	const docPath = doc.uri.path.replace('/', '')
	const content = parse(doc.getText())

	if (!jsonFiles.find((file) => file.filePath === docPath)) {
		jsonFiles.push({ filePath: docPath, content })
	} else {
		jsonFiles.forEach((file) => {
			if (file.filePath === docPath) {
				file.content = content
			}
		})
	}

	const allJSONsUpdated = jsonFiles.reduce(
		(acc, file: { content: Record<string, BlockItem> }) => ({ ...acc, ...file.content }),
		{}
	)

	return allJSONsUpdated
}
