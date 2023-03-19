import * as vscode from 'vscode'
import { BlocksHashMap } from '../BlocksHashMap'

export class WrapBlockActionProvider implements vscode.CodeActionProvider {
	constructor(
		public items: {
			title: string
			component: string
			props: (k: string, id: string) => Record<string, any>
		}[] = []
	) {}

	public static providedCodeActionKinds = [vscode.CodeActionKind.QuickFix]

	public provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range
	): vscode.CodeAction[] | undefined {
		return this.items
			.map((i) => {
				return this.createWrap(document, i.title, i.component, (blockName, id) => {
					return JSON.parse(
						JSON.stringify(i.props).replace('$id', id).replace('$blockName', blockName)
					)
				})
			})
			.filter(Boolean) as vscode.CodeAction[]
	}

	createWrap(
		document: vscode.TextDocument,
		title: string,
		component: string,
		props: (blockName: string, id: string) => Record<string, any>
	): vscode.CodeAction | undefined {
		// Mostrar apenas quando o cursor estiver na linha do bloco
		// ------------------------------------------------------------------
		const editor = vscode.window.activeTextEditor

		if (!editor) return

		const lineText = document.lineAt(editor.selection.active.line).text
		const blocks = BlocksHashMap.getBlocksNames(document.getText())

		const whichBlock = blocks.find((b) => new RegExp(`"${b}":\\s?{`, 'g').test(lineText))
		if (!whichBlock) return

		const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix)
		fix.edit = new vscode.WorkspaceEdit()
		fix.command = {
			title,
			command: 'vtexiointellisense.wrap',
			arguments: [document, whichBlock, component, props]
		}

		return fix
		// ------------------------------------------------------------------
	}
}
