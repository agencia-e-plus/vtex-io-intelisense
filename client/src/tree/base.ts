import * as vscode from 'vscode'
import { Collection } from '../collection'
import { BlocksHashMap } from '../BlocksHashMap'
import { join } from 'path'

export class BaseTreeProvider<TreeItem> implements vscode.TreeDataProvider<TreeItem> {
	public _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> =
		new vscode.EventEmitter<TreeItem | undefined | void>()
	readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> =
		this._onDidChangeTreeData.event
	public mediaFolder = join(__filename, '..', '..', '..', '..', 'media')
	components: TreeItem[]
	blockHashMap: BlocksHashMap
	blocks: Collection<string, Block>
	follows: Collection<string, string>

	constructor(blockHashMap: BlocksHashMap) {
		this.blocks = new Collection<string, Block>()
		this.follows = new Collection()
		this.components = []
		this.blockHashMap = blockHashMap

		this.update()
	}

	update() {
		throw new Error('Method not implemented.')
	}

	getMedia(name: string) {
		return join(this.mediaFolder, name)
	}

	parseJson(): TreeItem[] {
		throw new Error('Method not implemented.')
	}

	refresh() {
		this.update()
		this.components = this.parseJson()
		this._onDidChangeTreeData.fire()
	}

	getTreeItem(element: TreeItem): vscode.TreeItem {
		return element
	}

	getChildren(element?: TreeItem): Thenable<TreeItem[]> {
		throw new Error('Method not implemented.')
	}
}

export class TreeItem extends vscode.TreeItem {
	constructor(
		public label: string,
		public description: string,
		public children: TreeItem[] = [],
		public command?: vscode.Command,
		public iconPath?:
			| string
			| vscode.Uri
			| { light: string | vscode.Uri; dark: string | vscode.Uri }
	) {
		super(
			label,
			children.length > 0
				? vscode.TreeItemCollapsibleState.Collapsed
				: vscode.TreeItemCollapsibleState.None
		)
	}
}
