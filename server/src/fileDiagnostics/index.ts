import { Diagnostic } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { BlocksHashMap } from '../BlocksHashMap';
import { getUnusedBlocksDiagnostics } from './getUnusedBlocks';

export const getFileDiagnostics = (
	textDocument: TextDocument,
	maxNumberOfProblems: number,
	blocksHashMap: BlocksHashMap
) => {
	const filePath = URI.parse(textDocument.uri).fsPath;

	const text = textDocument.getText();

	const diagnostics: Diagnostic[] = [];

	const unusedBlocksDiagnostics = getUnusedBlocksDiagnostics(text, filePath, blocksHashMap);

	diagnostics.push(...unusedBlocksDiagnostics);

	return diagnostics.slice(0, maxNumberOfProblems);
};
