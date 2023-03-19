import { BlocksHashMap } from '../BlocksHashMap'
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver'
import * as JSONC from 'jsonc-parser'
import { getUsagePositionInText } from '../utils/getUsagePositionInText'

export const getUndeclaredBlocksDiagnostics = (
	fileText: string,
	filePath: string,
	blocksHashMap: BlocksHashMap
) => {
	const blocks: Record<string, Block> | undefined = JSONC.parse(fileText)

	if (!blocks) return []

	const usages = blocksHashMap.getFileUsage(filePath)

	if (!usages) return []

	const undeclaredBlocks = usages
		.filter((block) => !blocksHashMap.getBlockFilePath(block))
		.filter((blockName) => {
			return blockName.includes('#')
		})

	const diagnostics: Diagnostic[] = []

	undeclaredBlocks.forEach((blockId) => {
		const usagePosition = getUsagePositionInText(blockId, fileText)

		if (!usagePosition) return

		const diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: {
					line: usagePosition.start.line,
					character: usagePosition.start.character
				},
				end: {
					line: usagePosition.end.line,
					character: usagePosition.end.character
				}
			},
			message: `Block "${blockId}" is never declared`,
			source: 'block-declaration-checker (Vtex IO Intellisense)'
		}

		diagnostics.push(diagnostic)
	})

	return diagnostics
}
