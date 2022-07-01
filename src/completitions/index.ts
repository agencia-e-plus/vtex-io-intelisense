import * as vscode from 'vscode'
import { Singleton } from '../fileRegister'

export const provider = vscode.languages.registerCompletionItemProvider('jsonc', {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
		// get all text until the `position` and check if it reads `console.`
		// and if so then complete if `log`, `warn`, and `error`
		const linePrefix = document.lineAt(position).text.substr(0, position.character)
		if (!linePrefix.includes('"children": [') && !linePrefix.includes('"blocks": [')) {
			console.log('aqui')
			return undefined
		}
		console.log('fora')

		const { allJSONs } = Singleton.getInstance()

		return Object.keys(allJSONs).map(
			(key) => new vscode.CompletionItem(`"${key}"`, vscode.CompletionItemKind.Enum)
		)
	}
})
