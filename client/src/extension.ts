import * as path from 'path'

import * as vscode from 'vscode'
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node'
import { WrapBlockActionProvider } from './action-providers/wrap-block'

import { BlocksHashMap } from './BlocksHashMap'
import { goToComponent } from './commands/go-to-component'
import { wrapBlock } from './commands/wrap-block'
import { ParentProvider } from './tree/parentComponents'
import { TreeProvider } from './tree/treeComponents'

let client: LanguageClient
let b: BlocksHashMap

export function activate(context: vscode.ExtensionContext) {
	// The server is implemented in node
	const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'))
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] }

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	}

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [
			//{ scheme: 'file', language: 'json' },
			{ scheme: 'file', language: 'jsonc' }
		],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
		}
	}

	// Create the language client and start the client.
	client = new LanguageClient(
		'vtexiointellisense',
		'Vtex IO Intellisense',
		serverOptions,
		clientOptions
	)

	// Start the client. This will also launch the server
	client.start()

	// --------------------- CLIENT ---------------------
	const configs = vscode.workspace.getConfiguration('vtexiointellisense')
	const rootDir = vscode.workspace.workspaceFolders?.[0].uri.fsPath.replace(/\\/g, '/')
	const wrapProvider = new WrapBlockActionProvider(configs.get('wraps'))

	vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration('vtexiointellisense')) {
			wrapProvider.items = vscode.workspace
				.getConfiguration('vtexiointellisense')
				.get('wraps')
		}
	})

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider('jsonc', wrapProvider, {
			providedCodeActionKinds: WrapBlockActionProvider.providedCodeActionKinds
		})
	)

	b = new BlocksHashMap(rootDir)

	const treeProvider = new TreeProvider(b)
	const parentProvider = new ParentProvider(b)

	const watcher = vscode.workspace.createFileSystemWatcher('**/*.jsonc')

	watcher.onDidChange((e) => {
		b.refill()
		treeProvider.refresh()
		parentProvider.refresh()
	})
	watcher.onDidCreate((e) => {
		b.refill()
		treeProvider.refresh()
		parentProvider.refresh()
	})
	watcher.onDidDelete((e) => {
		b.refill()
		treeProvider.refresh()
		parentProvider.refresh()
	})

	vscode.window.registerTreeDataProvider('components', treeProvider)
	vscode.window.registerTreeDataProvider('parents', parentProvider)

	context.subscriptions.push(wrapBlock)
	context.subscriptions.push(goToComponent)

	console.log('Vtex IO Intellisense is now active!')
}

export function deactivate() {
	return client?.stop()
}
