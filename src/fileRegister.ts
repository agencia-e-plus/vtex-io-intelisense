import { getFiles, GetFilesResult, IAllJSONs, IJSONFile } from './diagnostics/utils/getFiles'
import * as vscode from 'vscode'
import { parse } from 'jsonc-parser'
import glob = require('glob')
import * as fs from 'fs'

class FileRegister {
	jsonFiles: IJSONFile[] = []
	allJSONs: IAllJSONs = {}

	constructor() {
		getFiles()
	}

	getFiles = (): GetFilesResult => {
		const [folder] = vscode?.workspace?.workspaceFolders || ([] as vscode.WorkspaceFolder[])

		const files = glob.sync(folder?.uri?.fsPath + '/**/store/blocks/**/*.{json,jsonc}')

		const filesData = files.reduce(
			(content: any, filePath: string) => {
				const file = fs.readFileSync(filePath, { encoding: 'utf-8' })

				if (!file) return content

				const contentObj = parse(file)

				return {
					allJSONs: { ...content.allJSONs, ...contentObj },

					jsonFiles: [...content.jsonFiles, { filePath, content: contentObj }]
				}
			},

			{ allJSONs: {}, jsonFiles: [] }
		)

		this.allJSONs = filesData.allJSONs
		this.jsonFiles = filesData.jsonFiles

		return filesData
	}

	updateFiles = (doc: vscode.TextDocument) => {
		const docPath = doc.uri.fsPath
		const textContent = doc.getText()

		if (textContent && textContent != '') {
			const content = parse(textContent)

			if (!this.jsonFiles.find((file) => file.filePath === docPath)) {
				this.jsonFiles.push({ filePath: docPath, content })
			} else {
				this.jsonFiles.forEach((file) => {
					if (file.filePath === docPath) {
						file.content = content
					}
				})
			}
		}

		const allJSONsUpdated = this.jsonFiles.reduce(
			(acc, file: { content: Record<string, BlockItem> }) => ({ ...acc, ...file.content }),
			{}
		)

		this.allJSONs = allJSONsUpdated
		return allJSONsUpdated
	}
}

export const Singleton = (function () {
	let instance: FileRegister

	function createInstance() {
		const object = new FileRegister()
		return object
	}

	return {
		getInstance: () => {
			if (!instance) {
				instance = createInstance()
			}
			return instance
		}
	}
})()
