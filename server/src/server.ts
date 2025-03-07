import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import { handleDefinitionRequest } from './handleDefinitionRequest';
import { BlocksHashMap } from './BlocksHashMap';
import { URI } from 'vscode-uri';
import { getFileDiagnostics } from './fileDiagnostics';
import { handleOnCompletion } from './handleOnCompletion';
import { handleCompletionResolve } from './handleCompletionResolve';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

// Initialize blocks hashmap
let blocksHashMap: BlocksHashMap | undefined = undefined;

connection.onInitialize((params: InitializeParams) => {
	console.log('initialize');
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			},
			// Tell the client that this server supports go to definition.
			definitionProvider: true
		}
	};

	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};

		if (params.workspaceFolders) {
			const workspacePath = URI.parse(params.workspaceFolders[0].uri).fsPath.replace(/\\/g, '/');

			blocksHashMap = new BlocksHashMap(workspacePath);
		}
	}
	return result;
});

connection.onInitialized(() => {
	console.log('VTEXIO intellisense server initialized!');

	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders((_event) => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(change.settings.languageServerExample || defaultSettings);
	}

	// Revalidate all open text documents
	documents.all().forEach((document) => {
		const path = URI.parse(document.uri).fsPath;

		if (!path.includes('blocks')) return;

		validateTextDocument(document);
	});
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	if (!blocksHashMap) return;

	const diagnostics = getFileDiagnostics(textDocument, 40, blocksHashMap);

	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Handles a request to provide the definition of a symbol at a given text document position.
connection.onDefinition((params) => {
	const isOnBlocksFolder = params.textDocument.uri.includes('blocks');

	if (!blocksHashMap || !isOnBlocksFolder) return undefined;

	return handleDefinitionRequest(params, blocksHashMap);
});

// Only keep settings for open documents
documents.onDidClose((e) => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
	if (!blocksHashMap) return;

	const path = URI.parse(change.document.uri).fsPath;

	if (!path.includes('blocks')) return;

	// Update the blocks hash map with the new content
	blocksHashMap.mapBlocksOnFile(path, change.document.getText());

	// Validate all open documents since changes in one file might affect others
	documents.all().forEach((document) => {
		const docPath = URI.parse(document.uri).fsPath;
		if (docPath.includes('blocks')) {
			validateTextDocument(document);
		}
	});
});

connection.onDidChangeWatchedFiles((_change) => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
	console.log('onCompletion');
	if (!blocksHashMap) return [];
	return handleOnCompletion(params, blocksHashMap, documents, connection);
});

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	if (!blocksHashMap) return item;
	return handleCompletionResolve(item, blocksHashMap);
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
