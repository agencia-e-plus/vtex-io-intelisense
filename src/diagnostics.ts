import * as vscode from "vscode"
import { glob } from "glob"
import { parse } from "jsonc-parser"
import fs = require("fs")

/** Code that is used to associate diagnostic entries with code actions. */
export const UNUSED_BLOCK = "unused_block"
export const NO_EXPLICIT_USE_BLOCKS = ["store.", "header", "header.", "footer"]

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
	console.log("rodou")

	// const currentFilePath = doc.fileName.replace(/\\/g, "/")

	const [folder] =
		vscode?.workspace?.workspaceFolders || ([] as vscode.WorkspaceFolder[])

	const files = glob.sync(
		folder?.uri?.fsPath + "/**/store/blocks/**/*.{json,jsonc}"
	)

	const { allJSONs, jsonFiles } = files.reduce(
		(content: any, file: any) => {
			const x = fs.readFileSync(file, { encoding: "utf-8" })
			const contentObj = file.endsWith(".jsonc") ? parse(x) : JSON.parse(x)

			return {
				allJSONs: { ...content.allJSONs, ...contentObj },
				jsonFiles: [
					...content.jsonFiles,
					{ filePath: file, content: contentObj }
				]
			}
		},
		{ allJSONs: {}, jsonFiles: [] }
	)

	console.log(allJSONs)

	// if (!files.includes(currentFilePath)) {
	// 	return
	// }

	// const currentDocumentText = doc.getText()

	// const currentDocumentObject = parse(currentDocumentText)

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
				if (lineOfText.text.includes(`"${id}"`)) {
					diagnostics.push(
						createDiagnostic(doc, lineOfText, lineIndex, `"${id}"`)
					)
				}
			}
		})

		blocksDiagnostics.set(doc.uri, diagnostics)
	})

	console.log("finalizou")
}

function createDiagnostic(
	doc: vscode.TextDocument,
	lineOfText: vscode.TextLine,
	lineIndex: number,
	word: string
): vscode.Diagnostic {
	const index = lineOfText.text.indexOf(word)

	// create range that represents, where in the document the word is
	const range = new vscode.Range(
		lineIndex,
		index,
		lineIndex,
		index + word.length
	)

	const diagnostic = new vscode.Diagnostic(
		range,
		"Unused block",
		vscode.DiagnosticSeverity.Warning
	)
	diagnostic.code = UNUSED_BLOCK
	return diagnostic
}

export function subscribeToDocumentChanges(
	context: vscode.ExtensionContext,
	blocksDiagnostics: vscode.DiagnosticCollection
): void {
	const configs = vscode.workspace.getConfiguration("vtexiointellisense")

	// if (configs.allowsUnusedBlocks) {
	// 	return
	// }

	if (vscode.window.activeTextEditor) {
		refreshDiagnostics(
			// vscode.window.activeTextEditor.document,
			blocksDiagnostics
		)
	}
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor((editor) => {
			if (editor) {
				refreshDiagnostics(blocksDiagnostics)
			}
		})
	)

	// context.subscriptions.push(
	// 	vscode.workspace.onDidChangeTextDocument((e) =>
	// 		refreshDiagnostics(e.document, blocksDiagnostics)
	// 	)
	// )

	// context.subscriptions.push(
	// 	vscode.workspace.onDidCreateFiles()
	// )
	// //
	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument((doc) =>
			blocksDiagnostics.delete(doc.uri)
		)
	)
}

const checkUse = (id: string, json: GenericObject) => {
	const uses = Object.entries(json).some(([_key, value]) => {
		let inChildren,
			inBlocks,
			inProp,
			inThen,
			inElse = false

		if (value.children) {
			inChildren = value.children.includes(id)
		}

		if (value.blocks) {
			inBlocks = value.blocks.includes(id)
		}

		if (value.props) {
			if (value.props.hasOwnProperty("Then")) {
				inThen = value.props.Then.includes(id)
			}
			if (value.props.hasOwnProperty("Else")) {
				inElse = value.props.Else.includes(id)
			}

			inProp = Object.entries(value.props).some(
				([key, value]) => key.match(/^[A-Z]/) && value === id
			)
		}
		return inChildren || inBlocks || inThen || inElse || inProp
	})

	if (!uses) {
		return id
	}
}

const checkKey = (currentDocument: any, json: any) => {
	const blockIds = Object.entries(currentDocument).reduce<string[]>(
		(acc, [key, _value]) => {
			const id = checkUse(key, json)
			if (id) {
				return [...acc, id]
			}
			return acc
		},
		[]
	)

	return blockIds
}
