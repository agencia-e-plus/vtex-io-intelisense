import * as vscode from 'vscode'
import { glob } from 'glob'
import { parse } from 'jsonc-parser'
import fs = require('fs')
import { UNUSED_BLOCK } from './unused_blocks'
import { DUPLICATE_BLOCK } from './duplicated_blocks'

/** Code that is used to associate diagnostic entries with code actions. */

export const NO_EXPLICIT_USE_BLOCKS = ['store.', 'header', 'header.', 'footer']

type BlockFormat = {
	props?: {
		Then: string
		Else: string
		[key: string]: string
	}
	blocks?: string[]
	children?: string[]
}

type GenericObject = {
	[key: string]: BlockFormat
}

const getFiles = () => {
	const [folder] = vscode?.workspace?.workspaceFolders || ([] as vscode.WorkspaceFolder[])

	const files = glob.sync(folder?.uri?.fsPath + '/**/store/blocks/**/*.{json,jsonc}')

	return files.reduce(
		(content: any, file: any) => {
			const x = fs.readFileSync(file, { encoding: 'utf-8' })
			const contentObj = parse(x)

			return {
				allJSONs: { ...content.allJSONs, ...contentObj },
				jsonFiles: [...content.jsonFiles, { filePath: file, content: contentObj }]
			}
		},
		{ allJSONs: {}, jsonFiles: [] }
	)
}

const checkUse = (id: string, json: GenericObject) => {
	const uses = Object.entries(json).some(([_key, value]) => {
		let inChildren, inBlocks, inProp

		if (value.children) {
			inChildren = value.children.includes(id)
		}

		if (value.blocks) {
			inBlocks = value.blocks.includes(id)
		}

		if (value.props) {
			inProp = Object.entries(value.props).some(
				([key, value]) => key.match(/^[A-Z]/) && value === id
			)
		}
		return inChildren || inBlocks || inProp
	})

	if (!uses) {
		return id
	}
}

const checkKey = (currentDocument: Record<string, unknown>, json: GenericObject) => {
	const blockIds = Object.entries(currentDocument).reduce<string[]>((acc, [key, _value]) => {
		const id = checkUse(key, json)
		if (id) {
			return [...acc, id]
		}
		return acc
	}, [])

	return blockIds
}

function createDiagnostic(
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

/** String to detect in the text document. */

/**
 * Analyzes the text document for problems.
 * @param doc text document to analyze
 * @param blocksDiagnostics diagnostic collection
 */
export function refreshDiagnostics(
	// doc: vscode.TextDocument,
	blocksDiagnostics: vscode.DiagnosticCollection
): void {
	const { allJSONs, jsonFiles } = getFiles()

	const checkedFiles = jsonFiles.map(({ filePath, content }) => ({
		filePath,
		ids: checkKey(content, allJSONs)
	}))

	const filesWithFilteredIds = checkedFiles.map(({ filePath, ids }) => ({
		filePath,
		ids: ids.filter((id) => {
			return !NO_EXPLICIT_USE_BLOCKS.some((blockId) => id.startsWith(blockId))
		})
	}))

	filesWithFilteredIds.map(async ({ filePath, ids }) => {
		const diagnostics: vscode.Diagnostic[] = []

		const uri = vscode.Uri.file(filePath)
		const doc = await vscode.workspace.openTextDocument(uri)
		console.log(uri)

		ids.forEach((id) => {
			for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
				const lineOfText = doc.lineAt(lineIndex)
				if (lineOfText.text.includes(`"${id}":`)) {
					diagnostics.push(createDiagnostic(lineOfText, lineIndex, `"${id}"`, UNUSED_BLOCK))
				}
			}
		})

		blocksDiagnostics.set(doc.uri, diagnostics)
	})
}

export function refreshDocumentDiagnostics(
	doc: vscode.TextDocument,
	allJSONs: any,
	blocksDiagnostics: vscode.DiagnosticCollection
): void {
	const currentDocument = doc.getText()

	const currentDocumentObj = parse(currentDocument)

	const ids = checkKey(currentDocumentObj, allJSONs)

	const filesWithFilteredIds = ids.filter(
		(id) => !NO_EXPLICIT_USE_BLOCKS.some((blockId) => id.startsWith(blockId))
	)

	const diagnostics: vscode.Diagnostic[] = []

	filesWithFilteredIds.forEach((id) => {
		for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
			const lineOfText = doc.lineAt(lineIndex)
			if (lineOfText.text.includes(`"${id}":`)) {
				diagnostics.push(createDiagnostic(lineOfText, lineIndex, `"${id}"`, UNUSED_BLOCK))
			}
		}
	})

	blocksDiagnostics.set(doc.uri, diagnostics)
}

export const findDocumentDuplicatedBlocks = (
	doc: vscode.TextDocument,
	jsonFiles: any[],
	blocksDiagnostics: vscode.DiagnosticCollection
) => {
	console.log(jsonFiles)
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
	console.log(blocksOccurrences)

	const duplicatedBlocks: { id: string; filesPaths: string[] }[] = Object.entries<string[]>(
		blocksOccurrences
	).reduce((acc, [key, value]) => {
		if (value.length > 1) {
			acc.push({ id: key, filesPaths: value })
		}
		return acc
	}, [] as any[])
	console.log(duplicatedBlocks)

	const currentFileDuplicated = duplicatedBlocks.filter(({ filesPaths }) =>
		filesPaths.includes(doc.uri.path.replace('/', ''))
	)
	console.log(currentFileDuplicated)

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

export function subscribeToDocumentChanges(
	context: vscode.ExtensionContext,
	blocksDiagnostics: vscode.DiagnosticCollection,
	duplicatedBlocksDiagnostics: vscode.DiagnosticCollection
): void {
	const configs = vscode.workspace.getConfiguration('vtexiointellisense')

	const [folder] = vscode?.workspace?.workspaceFolders || ([] as vscode.WorkspaceFolder[])

	const files = glob.sync(folder?.uri?.fsPath + '/**/store/blocks/**/*.{json,jsonc}')

	const { allJSONs, jsonFiles } = files.reduce(
		(content: any, file: any) => {
			const x = fs.readFileSync(file, { encoding: 'utf-8' })
			const contentObj = parse(x)

			return {
				allJSONs: { ...content.allJSONs, ...contentObj },
				jsonFiles: [...content.jsonFiles, { filePath: file, content: contentObj }]
			}
		},
		{ allJSONs: {}, jsonFiles: [] }
	)

	if (vscode.window.activeTextEditor) {
		const document = vscode.window.activeTextEditor.document
		jsonFiles.forEach((file) => {
			if (file.filePath === document.uri.path.replace('/', '')) {
				const content = document.getText()
				file.content = parse(content)
			}
		})

		const allJSONsUpdated = jsonFiles.reduce(
			(acc, file: { content: Record<string, unknown> }) => ({ ...acc, ...file.content }),
			{}
		)

		refreshDocumentDiagnostics(document, allJSONsUpdated, blocksDiagnostics)
		findDocumentDuplicatedBlocks(document, jsonFiles, duplicatedBlocksDiagnostics)
	}

	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				const document = editor.document
				jsonFiles.forEach((file) => {
					if (file.filePath === document.uri.path.replace('/', '')) {
						const content = document.getText()
						file.content = parse(content)
					}
				})

				const allJSONsUpdated = jsonFiles.reduce(
					(acc, file: { content: Record<string, unknown> }) => ({ ...acc, ...file.content }),
					{}
				)

				refreshDocumentDiagnostics(document, allJSONsUpdated, blocksDiagnostics)
				findDocumentDuplicatedBlocks(document, jsonFiles, duplicatedBlocksDiagnostics)
			}
		})
	)

	// context.subscriptions.push(
	// 	vscode.workspace.onDidChangeTextDocument((e) =>
	// 		refreshDocumentDiagnostics(e.document, allJSONs, blocksDiagnostics)
	// 	)
	// )

	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument((doc) => {
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

			refreshDocumentDiagnostics(doc, allJSONsUpdated, blocksDiagnostics)
			findDocumentDuplicatedBlocks(doc, jsonFiles, duplicatedBlocksDiagnostics)
		})
	)

	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument((doc) => blocksDiagnostics.delete(doc.uri))
	)
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
	}, {})

	const duplicatedBlocks: { id: string; filesPaths: string[] }[] = Object.entries<string[]>(
		blocksOccurrences
	).reduce((acc, [key, value]) => {
		if (value.length > 1) {
			acc.push({ id: key, filesPaths: value })
		}
		return acc
	}, [] as any[])

	console.log(duplicatedBlocks)

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
