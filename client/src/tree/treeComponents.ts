import { readFileSync } from 'fs'
import { join } from 'path'

import * as vscode from 'vscode'
import { Collection } from '../collection'
import { BaseTreeProvider, TreeItem } from './base'

export class TreeProvider extends BaseTreeProvider<TreeItem> {
	update() {
		let blocks = new Collection<string, Block>()
		const allBlocks = Collection.fromMap(this.blockHashMap.getAllBlocks())

		for (const k of allBlocks.keys()) {
			const name = k.split('#')[0]

			if (!blocks.has(name)) {
				blocks.set(name, {
					// Não precisa definir o title, pois uso o nome do bloco
					title: '',
					children: [k]
				})
			} else {
				blocks.get(name)?.children.push(k)
			}
		}

		blocks = blocks.sort()

		for (const [k, v] of [...blocks.entries()]) {
			const name = `${v.children.length} ${k}`

			blocks.set(name, v)
			blocks.delete(k)
		}

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
		return [...this.blocks].map(([k, v]) => {
			let children: TreeItem[] = []

			if (v.children?.length) {
				children = v.children.map((c: string) => {
					return new TreeItem(
						c,
						this.blocks.get(c)?.title ?? '',
						undefined,
						{
							command: 'vtexiointellisense.goToComponent',
							title: '',
							arguments: [c, this.follows.toObject()]
						},
						{
							light: join(__filename, '..', '..', '..', '..', 'media', 'file.svg'),
							dark: join(__filename, '..', '..', '..', '..', 'media', 'file.svg')
						}
					)
				})
			}

			return new TreeItem(k, this.blocks.get(k)?.title ?? '', children, undefined, {
				light: join(__filename, '..', '..', '..', '..', 'media', 'container.svg'),
				dark: join(__filename, '..', '..', '..', '..', 'media', 'container.svg')
			})
		})
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
		if (element) {
			return Promise.resolve(element.children)
		} else {
			const components = this.components.filter((c) => c.children.length > 0)

			return Promise.resolve(components)
		}
	}
}
