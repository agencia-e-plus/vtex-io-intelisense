import * as vscode from 'vscode'
import { parse } from 'jsonc-parser'
import { getFiles } from './utils/getFiles'
import { createDiagnostic } from './utils/createDiagnostic'

export const UNUSED_BLOCK = 'unused_block'
export const NO_EXPLICIT_USE_BLOCKS = ['store.', 'header', 'header.', 'footer']

const checkUse = (id: string, json: BlockItem) => {
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

const checkKey = (currentDocument: Record<string, unknown>, json: BlockItem) => {
	const blockIds = Object.entries(currentDocument).reduce<string[]>((acc, [key, _value]) => {
		const id = checkUse(key, json)
		if (id) {
			return [...acc, id]
		}
		return acc
	}, [])

	return blockIds
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

	if (!currentDocument) return

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
