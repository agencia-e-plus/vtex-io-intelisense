import * as vscode from 'vscode'
import { parse } from 'jsonc-parser'
import { replaceInFileSync } from 'replace-in-file'

export const wrapBlock = vscode.commands.registerCommand(
	'vtexiointellisense.wrap',
	async (
		document: vscode.TextDocument,
		whichBlock: string,
		component: string,
		props: (k: string, id: string) => Record<string, any>
	) => {
		const id = await vscode.window.showInputBox({
			prompt: 'Enter the block id'
		})

		if (!id) return

		const workspaces = vscode.workspace.workspaceFolders ?? []
		const editor = vscode.window.activeTextEditor

		if (!editor) return

		replaceInFileSync({
			files: `${workspaces[0].uri.fsPath}/**/*.jsonc`,
			ignore: document.fileName,
			from: new RegExp(`${whichBlock}(?="[^:])`, 'gm'),
			to: `${component}#${id}`
		})

		const newData = {} as Record<string, any>
		const parsed = parse(
			document
				.getText()
				.replace(new RegExp(`${whichBlock}(?="[^:])`, 'gm'), `${component}#${id}`)
		)

		for (const [k, v] of Object.entries(parsed)) {
			if (k === whichBlock) {
				newData[`${component}#${id}`] = props(k, id)
			}

			newData[k] = v
		}

		editor.edit((edit) => {
			edit.replace(
				new vscode.Range(
					new vscode.Position(0, 0),
					new vscode.Position(document.lineCount, 0)
				),
				JSON.stringify(newData, null, 4)
			)
		})
	}
)
