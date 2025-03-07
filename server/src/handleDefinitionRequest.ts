import { DefinitionParams, LocationLink } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import * as JSONC from 'jsonc-parser';
import { BlocksHashMap } from './BlocksHashMap';
import { getBlockPositionInText } from './utils/getBlockPositionInText';

/**
 * Handles a request to provide the definition of a block reference at a given text document position.
 * This allows users to navigate to the definition of a block by clicking on its reference.
 */
export const handleDefinitionRequest = (params: DefinitionParams, blocksHashMap: BlocksHashMap): LocationLink[] | undefined => {
	const { textDocument, position } = params;

	const filePath = URI.parse(textDocument.uri).fsPath;
	const fileText = blocksHashMap.getFileContent(filePath);
	if (!fileText) return undefined;

	// Convert position to offset for JSONC scanner
	const offset = getOffsetAtPosition(fileText, position);

	// Find the string token at the current position
	const stringToken = findStringTokenAtOffset(fileText, offset);
	if (!stringToken) return undefined;

	const { value: blockId, range } = stringToken;

	// Check if this is a block reference (not a property name)
	if (isPropertyName(fileText, range.start)) return undefined;

	// Try to find the definition of the block
	try {
		const definitionFilePath = blocksHashMap.getBlockFilePath(blockId);
		if (!definitionFilePath) return undefined;

		const definitionFileContent = blocksHashMap.getFileContent(definitionFilePath);
		if (!definitionFileContent) return undefined;

		const definitionPosition = getBlockPositionInText(blockId, definitionFileContent);
		if (!definitionPosition) return undefined;

		// Convert the token range to document positions for proper highlighting
		const originRange = {
			start: positionAt(fileText, range.start + 1), // +1 to skip the opening quote
			end: positionAt(fileText, range.end - 1)      // -1 to skip the closing quote
		};

		// Return a LocationLink which includes originSelectionRange for proper highlighting
		return [{
			originSelectionRange: originRange,
			targetUri: URI.file(definitionFilePath).toString(),
			targetRange: definitionPosition,
			targetSelectionRange: definitionPosition
		}];
	} catch (error) {
		console.error(`Error finding definition for block "${blockId}":`, error);
		return undefined;
	}
};

/**
 * Calculates the character offset at a given position in the document
 */
function getOffsetAtPosition(text: string, position: { line: number; character: number }): number {
	const lines = text.split(/\r?\n/);
	let offset = 0;

	for (let i = 0; i < position.line; i++) {
		offset += lines[i].length + 1; // +1 for the newline character
	}

	return offset + position.character;
}

/**
 * Converts an offset to a Position object
 */
function positionAt(text: string, offset: number): { line: number; character: number } {
	const lines = text.split(/\r?\n/);
	let currentOffset = 0;
	let lineNumber = 0;

	for (const line of lines) {
		const lineLength = line.length + 1; // +1 for the newline character
		if (currentOffset + lineLength > offset) {
			return {
				line: lineNumber,
				character: offset - currentOffset
			};
		}
		currentOffset += lineLength;
		lineNumber++;
	}

	// Fallback for end of document
	return {
		line: lines.length - 1,
		character: lines[lines.length - 1].length
	};
}

/**
 * Finds a string token at the given offset in the text
 */
function findStringTokenAtOffset(text: string, offset: number): { value: string; range: { start: number; end: number } } | undefined {
	const scanner = JSONC.createScanner(text, true);
	let token = scanner.scan();

	while (token !== JSONC.SyntaxKind.EOF) {
		if (token === JSONC.SyntaxKind.StringLiteral) {
			const start = scanner.getTokenOffset();
			const length = scanner.getTokenLength();
			const end = start + length;

			// Check if cursor is inside this string token
			if (offset >= start && offset <= end) {
				return {
					value: scanner.getTokenValue(),
					range: { start, end }
				};
			}
		}
		token = scanner.scan();
	}

	return undefined;
}

/**
 * Checks if a string at the given position is a property name (key) in JSON
 */
function isPropertyName(text: string, position: number): boolean {
	const scanner = JSONC.createScanner(text, true);
	scanner.setPosition(position);

	// Scan the string token
	scanner.scan();

	// Check if the next token is a colon
	const nextToken = scanner.scan();
	return nextToken === JSONC.SyntaxKind.ColonToken;
}
