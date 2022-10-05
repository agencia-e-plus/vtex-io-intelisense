import { readFileSync } from 'fs';
import { DefinitionParams } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { BlocksHashMap } from './BlocksHashMap';
import { getBlockPositionInText } from './utils/getBlockPositionInText';

// Handles a request to provide the definition of a symbol at a given text document position.
export const handleDefinitionRequest = (params: DefinitionParams, blocksHashMap: BlocksHashMap) => {
	const { textDocument, position } = params;

	const filePath = URI.parse(textDocument.uri).fsPath;
	const fileText = blocksHashMap.getFileContent(filePath);

	const lines = fileText.split(/\r?\n/);
	const line = lines[position.line];

	if (!line) return undefined;

	const hoveredChar = line.charAt(position.character);

	let initialChar = hoveredChar;
	let endChar = hoveredChar;
	let matchStartsAt = position.character;
	let matchEndsAt = position.character + 1;

	while (initialChar !== '"' || endChar !== '"') {
		if (initialChar !== '"') matchStartsAt--;
		if (endChar !== '"') matchEndsAt++;

		if (matchStartsAt < 0) return undefined;
		if (matchEndsAt > line.length) return undefined;

		initialChar = line?.charAt(matchStartsAt);
		endChar = line?.charAt(matchEndsAt);
	}

	matchStartsAt++;

	const match = line.substring(matchStartsAt, matchEndsAt);
	const matchIsADefinition = line.includes(`"${match}":`);

	if (matchIsADefinition) return undefined;

	try {
		const definitionFilePath = blocksHashMap.getBlockFilePath(match);
		const definitionFileContent = blocksHashMap.getFileContent(definitionFilePath);
		const definitionPosition = getBlockPositionInText(match, definitionFileContent);

		if (!definitionPosition) return undefined;

		const {
			start: { line: startLine, character: startCharacter },
			end: { line: endLine, character: endCharacter }
		} = definitionPosition;

		return [
			{
				uri: textDocument.uri,
				originSelectionRange: {
					start: { line: position.line, character: matchStartsAt },
					end: { line: position.line, character: matchEndsAt }
				},
				targetUri: URI.file(definitionFilePath).toString(),
				targetSelectionRange: {
					start: { line: startLine, character: startCharacter },
					end: { line: endLine, character: endCharacter }
				},
				targetRange: {
					start: { line: startLine, character: startCharacter },
					end: { line: endLine, character: endCharacter }
				}
			}
		];
	} catch (error) {
		return;
	}
};
