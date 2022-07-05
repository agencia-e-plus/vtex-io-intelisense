import * as vscode from 'vscode'
import { Singleton } from '../fileRegister'

export const provider = vscode.languages.registerCompletionItemProvider('jsonc', {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
		// get all text until the `position` and check if it reads `console.`
		// and if so then complete if `log`, `warn`, and `error`

		const regex = /^(?!.*[^"#\w\-.:\s*,]).*/g

		let linePrefix = document.lineAt(position).text.slice(0, position.character)
		let findOpenLine = false
		if (linePrefix.match(regex)) {
			let index = position.line - 1
			while (!findOpenLine && index > 0) {
				const lineUp = position.with(index)
				if (!document.lineAt(lineUp).text.match(regex)) {
					linePrefix = document.lineAt(lineUp).text
					findOpenLine = true
				}
				index--
			}
		}

		if (!linePrefix.includes('"children": [') && !linePrefix.includes('"blocks": [')) {
			return undefined
		}

		const { allJSONs } = Singleton.getInstance()

		return Object.keys(allJSONs).map(
			(key) => new vscode.CompletionItem(`"${key}"`, vscode.CompletionItemKind.Enum)
		)
	}
})
