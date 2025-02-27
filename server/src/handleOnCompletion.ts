import { CompletionItem, CompletionItemKind, TextDocumentPositionParams } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as JSONC from 'jsonc-parser';
import { BlocksHashMap } from './BlocksHashMap';
import { Connection, MarkupKind, TextDocuments } from 'vscode-languageserver';

/**
 * Handles the onCompletion event for VTEX IO blocks
 * Suggests blocks only in specific contexts:
 * 1. Inside a "children" array
 * 2. Inside a "blocks" array
 * 3. In a value of a "props" object where the key starts with a capitalized letter
 */
export function handleOnCompletion(
	params: TextDocumentPositionParams,
	blocksHashMap: BlocksHashMap,
	documents: TextDocuments<TextDocument>,
	connection: Connection
): CompletionItem[] {
	const isOnBlocksFolder = params.textDocument.uri.includes('blocks');

	if (!blocksHashMap || !isOnBlocksFolder) return [];

	// Get the document content
	const document = documents.get(params.textDocument.uri);
	
	if (!document) return [];
	
	const text = document.getText();
	const position = params.position;
	const cursorOffset = document.offsetAt(position);
	
	// Check if the cursor is inside a string
	const scanner = JSONC.createScanner(text, true);
	let isInsideString = false;
	let needsQuotes = false; // Track if we need to add quotes
	let token = scanner.scan();
	scanner.setPosition(cursorOffset);
	
	while (token !== JSONC.SyntaxKind.EOF) {
		if (token === JSONC.SyntaxKind.StringLiteral) {
			const tokenOffset = scanner.getTokenOffset();
			const tokenLength = scanner.getTokenLength();
			const tokenEnd = tokenOffset + tokenLength;
			
			// Check if the cursor is inside this string token (including at the quotes)
			if (cursorOffset >= tokenOffset && cursorOffset <= tokenEnd) {
				// Get the actual string content without quotes
				const tokenText = text.substring(tokenOffset, tokenEnd);
				
				// Check if this string is a property name by looking at the next token
				const currentPosition = scanner.getPosition();
				const nextToken = scanner.scan();
				scanner.setPosition(currentPosition); // Reset position
				
				// If the next token is a colon, this is a property name, not a value
				const isPropertyName = nextToken === JSONC.SyntaxKind.ColonToken;
				
				if (!isPropertyName) {
					isInsideString = true;
					connection.console.log(`Cursor is inside string value: ${tokenText}`);
					break;
				} else {
					connection.console.log(`Cursor is inside property name, no suggestions`);
				}
			}
		} else if (token === JSONC.SyntaxKind.CommaToken || token === JSONC.SyntaxKind.OpenBracketToken) {
			// Check if cursor is right after this token
			const tokenEnd = scanner.getTokenOffset() + scanner.getTokenLength();
			if (cursorOffset >= tokenEnd && cursorOffset <= tokenEnd + 1) {
				// Cursor is right after a comma or opening bracket - we'll need to add quotes
				needsQuotes = true;
				connection.console.log(`Cursor is after comma or opening bracket, will add quotes`);
			}
		}
		token = scanner.scan();
	}
	
	// If not inside a string, don't provide suggestions
	// Unless we're right after a comma or opening bracket in an array
	if (!isInsideString && !needsQuotes) {
		// Check if we're in an array context but not inside a string
		const location = JSONC.getLocation(text, cursorOffset);
		const path = location.path;
		
		// Check if we're in a children or blocks array
		let inArrayContext = false;
		for (let i = 0; i < path.length - 1; i++) {
			const segment = path[i];
			if (typeof segment === 'string' && (segment === 'children' || segment === 'blocks')) {
				const nextSegment = path[i + 1];
				if (typeof nextSegment === 'number') {
					inArrayContext = true;
					needsQuotes = true;
					connection.console.log(`Cursor is in array context but not inside string, will add quotes`);
					break;
				}
			}
		}
		
		// Check if we're in a props object with a capitalized key
		if (!inArrayContext) {
			for (let i = 0; i < path.length - 1; i++) {
				const segment = path[i];
				if (typeof segment === 'string' && segment === 'props') {
					const nextSegment = path[i + 1];
					if (typeof nextSegment === 'string' && /^[A-Z]/.test(nextSegment)) {
						// Make sure we're in the value position
						const isValuePosition = i + 2 >= path.length || typeof path[i + 2] !== 'string';
						
						if (isValuePosition) {
							inArrayContext = true; // Not really an array, but we want to provide suggestions
							needsQuotes = true;
							connection.console.log(`Cursor is in props.${nextSegment} but not inside string, will add quotes`);
							break;
						}
					}
				}
			}
		}
		
		if (!inArrayContext) {
			connection.console.log('Cursor is not inside a string or valid context, no suggestions');
			return [];
		}
	}
	
	// Use jsonc-parser to get the location in the JSON document
	const location = JSONC.getLocation(text, cursorOffset);
	
	// Log the path for debugging
	connection.console.log(`Completion requested at path: ${JSON.stringify(location.path)}`);
	
	// Check if we're in a valid context for block suggestions
	const isInValidContext = isInSuggestableContext(location.path, connection);
	
	connection.console.log(`Is in valid context: ${isInValidContext}`);
	
	if (!isInValidContext) return [];

	const blockSuggestions = Array.from(blocksHashMap.listBlocks()).map(([key, value]) => {
		const label = key;
		const insertText = needsQuotes ? `"${key}"` : key;
		
		return {
			label,
			kind: CompletionItemKind.Variable,
			data: key,
			detail: `${value.split('store/blocks/')[1]}`,
			insertText,
			documentation: {
				kind: MarkupKind.Markdown,
				value: `\`\`\`json\n${JSON.stringify(blocksHashMap.getBlockContent(key), null, 2)}\n\`\`\``
			}
		} as CompletionItem;
	});

	return [...blockSuggestions];
}

/**
 * Determines if the current cursor position is in a context where block suggestions should be shown.
 * Valid contexts are:
 * 1. Inside a "children" array
 * 2. Inside a "blocks" array
 * 3. In a value of a "props" object where the key starts with a capitalized letter
 */
function isInSuggestableContext(path: JSONC.JSONPath, connection: Connection): boolean {
	if (path.length < 1) return false;
	
	// Convert path to string for easier debugging
	const pathStr = JSON.stringify(path);
	connection.console.log(`Checking path: ${pathStr}`);
	
	// Case 1 & 2: Inside a "children" or "blocks" array
	// We need to find a pattern like ["...", "children", <number>] or ["...", "blocks", <number>]
	for (let i = 0; i < path.length - 1; i++) {
		const segment = path[i];
		if (typeof segment === 'string' && (segment === 'children' || segment === 'blocks')) {
			// Check if the next segment is a number (array index)
			const nextSegment = path[i + 1];
			if (typeof nextSegment === 'number') {
				connection.console.log(`Found valid context: inside ${segment} array at index ${nextSegment}`);
				return true;
			}
		}
	}
	
	// Case 3: In a value of a "props" object where the key starts with a capitalized letter
	// We need to find a pattern like ["...", "props", "SomeCapitalizedKey"]
	for (let i = 0; i < path.length - 1; i++) {
		const segment = path[i];
		if (typeof segment === 'string' && segment === 'props') {
			// Check if the next segment is a string that starts with a capital letter
			const nextSegment = path[i + 1];
			if (typeof nextSegment === 'string' && /^[A-Z]/.test(nextSegment)) {
				// Make sure we're in the value position, not the key position
				// If there's another segment after this, we're likely in a nested object
				// which is fine as long as we're not in a property name position
				const isValuePosition = i + 2 >= path.length || typeof path[i + 2] !== 'string';
				
				if (isValuePosition) {
					connection.console.log(`Found valid context: inside props.${nextSegment}`);
					return true;
				}
			}
		}
	}
	
	connection.console.log('No valid context found');
	return false;
} 