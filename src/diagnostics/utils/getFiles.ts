import glob = require('glob')
import * as vscode from 'vscode'
import * as fs from 'fs'
import { parse } from 'jsonc-parser'

export const getFiles = () => {
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
