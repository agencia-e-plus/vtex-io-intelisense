import { CompletionItem, MarkupKind } from 'vscode-languageserver';
import { BlocksHashMap } from './BlocksHashMap';

/**
 * Resolves additional information for a completion item when it's focused
 */
export function handleCompletionResolve(
	item: CompletionItem,
	blocksHashMap: BlocksHashMap
): CompletionItem {
	// Check if this is a block suggestion that needs documentation
	if (item.data && typeof item.data === 'string') {
		const blockKey = item.data;
		// Only fetch and add documentation when resolving
		item.documentation = {
			kind: MarkupKind.Markdown,
			value: `\`\`\`json\n// ${blockKey}\n${JSON.stringify(
				blocksHashMap.getBlockContent(blockKey),
				null,
				2
			)}\n\`\`\``
		};
	}
	return item;
}
