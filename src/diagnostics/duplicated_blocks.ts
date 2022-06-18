import * as vscode from 'vscode'
import { createDiagnostic } from './utils/createDiagnostic'
import { getFiles } from './utils/getFiles'

export const DUPLICATE_BLOCK = 'duplicated_block'

export const findDocumentDuplicatedBlocks = (
	doc: vscode.TextDocument,
	jsonFiles: any[],
	blocksDiagnostics: vscode.DiagnosticCollection
) => {
	// find duplicated objects key in all JSON files
	const blocksOccurrences = jsonFiles.reduce((acc, file) => {
		const { content } = file
		const keys = Object.keys(content)

		keys.forEach((key) => {
			if (acc[key]) {
				acc[key].push(file.filePath)
			} else {
				acc = { ...acc, [key]: [file.filePath] }
			}
		})
		return acc
	}, {})

	const duplicatedBlocks: { id: string; filesPaths: string[] }[] = Object.entries<string[]>(
		blocksOccurrences
	).reduce((acc, [key, value]) => {
		if (value.length > 1) {
			acc.push({ id: key, filesPaths: value })
		}
		return acc
	}, [] as any[])

	const currentFileDuplicated = duplicatedBlocks.filter(({ filesPaths }) =>
		filesPaths.includes(doc.uri.path.replace('/', ''))
	)

	const diagnostics: vscode.Diagnostic[] = []

	currentFileDuplicated.map(({ id }) => {
		for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
			const lineOfText = doc.lineAt(lineIndex)
			if (lineOfText.text.includes(`"${id}":`)) {
				diagnostics.push(createDiagnostic(lineOfText, lineIndex, `"${id}"`, DUPLICATE_BLOCK))
			}
		}
	})
	blocksDiagnostics.set(doc.uri, diagnostics)
}

export const findDuplicatedBlocks = (blocksDiagnostics: vscode.DiagnosticCollection) => {
	const { jsonFiles } = getFiles()

	// find duplicated objects key in all JSON files
	const blocksOccurrences = jsonFiles.reduce((acc, file) => {
		const { content } = file
		const keys = Object.keys(content)

		keys.forEach((key) => {
			if (acc[key]) {
				acc[key].push(file.filePath)
			} else {
				acc = { ...acc, [key]: [file.filePath] }
			}
		})
		return acc
	}, {} as Record<string, string[]>)

	const duplicatedBlocks: { id: string; filesPaths: string[] }[] = Object.entries<string[]>(
		blocksOccurrences
	).reduce((acc, [key, value]) => {
		if (value.length > 1) {
			acc.push({ id: key, filesPaths: value })
		}
		return acc
	}, [] as any[])

	duplicatedBlocks.map(({ id, filesPaths }) => {
		const diagnostics: vscode.Diagnostic[] = []

		filesPaths.forEach(async (filePath) => {
			const uri = vscode.Uri.file(filePath)
			const doc = await vscode.workspace.openTextDocument(uri)

			for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
				const lineOfText = doc.lineAt(lineIndex)
				if (lineOfText.text.includes(`"${id}":`)) {
					diagnostics.push(createDiagnostic(lineOfText, lineIndex, `"${id}"`, DUPLICATE_BLOCK))
				}
			}

			blocksDiagnostics.set(doc.uri, diagnostics)
		})
	})
}
