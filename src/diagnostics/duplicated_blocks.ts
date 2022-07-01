import * as vscode from 'vscode'
import { Singleton } from '../fileRegister'
import { createDiagnostic } from './utils/createDiagnostic'

export const DUPLICATE_BLOCK = 'duplicated_block'

export const findDocumentDuplicatedBlocks = (
	doc: vscode.TextDocument,
	blocksDiagnostics: vscode.DiagnosticCollection
) => {
	const { jsonFiles } = Singleton.getInstance().getFiles()
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
	}, {} as Record<string, Array<any>>)

	const duplicatedBlocks: { id: string; filesPaths: string[] }[] = Object.entries<string[]>(
		blocksOccurrences
	).reduce((acc, [key, value]) => {
		if (value.length > 1) {
			acc.push({ id: key, filesPaths: value })
		}
		return acc
	}, [] as any[])

	const currentFileDuplicated = duplicatedBlocks.filter(({ filesPaths }) =>
		filesPaths.includes(doc.uri.fsPath)
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
	const { jsonFiles } = Singleton.getInstance().getFiles()

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
