import { readFileSync } from 'fs'
import { join } from 'path'

import * as vscode from 'vscode'
import { Collection } from '../collection'
import { BaseTreeProvider, TreeItem } from './base'

export class ParentProvider extends BaseTreeProvider<TreeItem> {
	update() {
		let blocks = new Collection<string, Block>()
		const allBlocks = Collection.fromMap(this.blockHashMap.getAllBlocks())

		for (const k of allBlocks.keys()) {
			if (!blocks.has(k)) {
				blocks.set(k, {
					// Não precisa definir o title, pois uso o nome do bloco
					title: '',
					children: []
				})
			}

			const children = allBlocks.get(k)?.children ?? []

			for (const c of children) {
				if (!blocks.has(c)) {
					blocks.set(c, {
						title: '',
						children: []
					})
				}

				blocks.get(c)?.children.push(k)
			}
		}

		blocks = blocks.sort()

		const follows = new Collection<string, string>()

		for (const file of this.blockHashMap.fileMap.keys()) {
			const text = readFileSync(file, 'utf-8')

			/*
			 	Regex super complicado que pega a linha onde o bloco foi definido
				e divide em "spaces" e "block":
			
				{   
	  				vvvvvvvvvvvvvv <- block
					"container": {
	  spaces -> ^^^^	...
					}
				}
			*/
			const blocks = [...text.matchAll(/^(?<spaces>( |\t)+)(?<block>".+":\s?{)/gm)].map(
				(m) => m.groups
			)

			const spaces = blocks.map((b) => b?.spaces?.length ?? 0)
			const smallestSpace = Math.min(...spaces)

			// O menor espaço é a linha onde o bloco foi definido
			// Linhas com mais espaços é o conteúdo dentro bloco
			const componentsBlocks = blocks
				.filter((b) => b?.spaces?.length === smallestSpace)
				.map((b) => b?.block ?? '')

			for (const c of componentsBlocks) {
				// Pego o nome do bloco removendo o conteúdo em volta
				// Ex: "container": { -> container
				const block = c.match(/".+"/g)![0].slice(1, -1)

				follows.set(block, file)
			}
		}

		this.blocks = blocks
		this.follows = follows
		this.components = this.parseJson()
	}

	parseJson(): TreeItem[] {
		const allBlocks = Collection.fromMap(this.blockHashMap.getAllBlocks())
		let items = new Collection<string, TreeItem>()

		const closeIcon = this.getMedia('x.svg')
		const parentIcon = this.getMedia('parent.svg')
		const storeWrapperIcon = this.getMedia('crown.svg')

		for (const [blockName, v] of this.blocks) {
			items.set(
				blockName,
				new TreeItem(
					blockName,
					this.blocks.get(blockName)?.title ?? '',
					[],
					{
						command: 'vtexiointellisense.goToComponent',
						title: '',
						arguments: [blockName, this.follows.toObject()]
					},
					{
						light: closeIcon,
						dark: closeIcon
					}
				)
			)
		}

		for (const [blockName, v] of this.blocks) {
			let children: TreeItem[] = []

			if (v.children?.length) {
				children = v.children.map((c: string) => {
					return new TreeItem(
						c,
						this.blocks[c]?.title ?? '',
						undefined,
						{
							command: 'vtexiointellisense.goToComponent',
							title: '',
							arguments: [c, this.follows.toObject()]
						},
						{
							light: this.getMedia('children.svg'),
							dark: this.getMedia('children.svg')
						}
					)
				})
			}

			for (const [pk, pv] of Object.entries(allBlocks.get(blockName)?.props ?? {})) {
				if (blockName !== 'storeWrapper' && /^[A-Z]/.test(pk)) {
					const item = items.get(pv)

					item.children.push(
						new TreeItem(
							blockName,
							allBlocks.get(blockName)?.title ?? '',
							undefined,
							{
								command: 'vtexiointellisense.goToComponent',
								title: '',
								arguments: [blockName, this.follows.toObject()]
							},
							{
								light: this.getMedia('children.svg'),
								dark: this.getMedia('children.svg')
							}
						)
					)
				}
			}

			const item = items.get(blockName)

			if (item) {
				item.children.push(...children)
				item.iconPath = {
					light:
						blockName === 'storeWrapper'
							? storeWrapperIcon
							: item.children.length
							? parentIcon
							: closeIcon,
					dark:
						blockName === 'storeWrapper'
							? storeWrapperIcon
							: item.children.length
							? parentIcon
							: closeIcon
				}
				item.collapsibleState = item.children.length
					? vscode.TreeItemCollapsibleState.Collapsed
					: vscode.TreeItemCollapsibleState.None
			}
		}

		items = items.sort((i) => i.label, true).sort((i) => i.children.length, true)

		return [...items.values()]
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
		return Promise.resolve(element ? element.children : this.components)
	}
}
