import { BlocksHashMap } from '../BlocksHashMap'
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver'
import * as JSONC from 'jsonc-parser'
import { getBlockPositionInText } from '../utils/getBlockPositionInText'

export const NO_EXPLICIT_USE_BLOCKS = ['store.', 'header', 'header.', 'footer']

export const getUnusedBlocksDiagnostics = (
	fileText: string,
	filePath: string,
	blocksHashMap: BlocksHashMap
) => {
	const blocks: Record<string, Block> | undefined = JSONC.parse(fileText)

	if (!blocks) return []

	const unusedBlocksOnFile = Object.keys(blocks)
		.filter((blockName) => {
			const isUsed = blocksHashMap.getBlockUsage(blockName)

			return !isUsed
		})
		.filter(
			(blockName) => !NO_EXPLICIT_USE_BLOCKS.some((blockId) => blockName.startsWith(blockId))
		)

	const diagnostics: Diagnostic[] = []

	unusedBlocksOnFile.forEach((blockId) => {
		const blockPosition = getBlockPositionInText(blockId, fileText)

		if (!blockPosition) return

		const diagnostic = {
			severity: DiagnosticSeverity.Warning,
			range: {
				start: {
					line: blockPosition.start.line,
					character: blockPosition.start.character
				},
				end: {
					line: blockPosition.end.line,
					character: blockPosition.end.character
				}
			},
			message: `Block "${blockId}" is never used`,
			source: 'block-usage-checker (Vtex IO Intellisense)'
		}

		diagnostics.push(diagnostic)
	})

	return diagnostics
}
