import * as vscode from 'vscode'

export const goToComponent = vscode.commands.registerCommand(
	'vtexiointellisense.goToComponent',
	(block: string, follows: Record<string, string>) => {
		if (!Object.prototype.hasOwnProperty.call(follows, block)) {
			return vscode.window.showErrorMessage(`${block} not found`)
		}

		const path = follows[block]

		vscode.workspace.openTextDocument(path).then((doc) => {
			vscode.window.showTextDocument(doc).then((editor) => {
				let line = 0

				for (let i = 0; i < editor.document.lineCount; i++) {
					const lineText = editor.document.lineAt(i).text

					if (new RegExp(`"${block}":`).test(lineText)) {
						line = i + 1
						break
					}
				}

				const range = editor.document.lineAt(Math.max(0, +line - 1)).range

				editor.selection = new vscode.Selection(range.start, range.end)
				editor.revealRange(range)
			})
		})
	}
)
