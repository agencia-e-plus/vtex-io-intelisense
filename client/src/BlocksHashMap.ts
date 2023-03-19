import { readFileSync } from 'fs'
import { glob } from 'glob'
import * as JSONC from 'jsonc-parser'

export class BlocksHashMap {
	public rootPath: string
	// blockName: filePath
	public blocksMap = new Map<string, string>()

	// filePath: fileContent
	public fileMap = new Map<string, string | Buffer>()

	// filePath: blockNames
	public fileUsagesMap = new Map<string, string[]>()

	constructor(rootPath: string) {
		this.rootPath = rootPath.replace(/\\/g, '/')
		this.fill()
	}

	fill() {
		const filesPaths = glob.sync(`${this.rootPath}/**/*.{json,jsonc}`)
		const blocksFilesPaths = filesPaths.filter((filePath) => filePath.includes('blocks'))

		blocksFilesPaths.forEach((filePath) => this.add(filePath))
	}

	clear() {
		this.blocksMap.clear()
		this.fileMap.clear()
		this.fileUsagesMap.clear()
	}

	refill() {
		this.clear()
		this.fill()
	}

	add(filePath: string, customText?: string) {
		const fileContent = customText || readFileSync(filePath, 'utf-8')

		if (fileContent === '') return
		let blocks = {} as Record<string, Block>

		try {
			blocks = JSONC.parse(fileContent)
		} catch (error) {
			console.log(`unable to parse file ${filePath}`)
			return
		}

		Object.keys(blocks).forEach((blockName) => {
			this.blocksMap.set(blockName, filePath)
		})

		this.fileMap.set(filePath, fileContent)
		this.mapBlocksUsages(filePath, blocks)
	}

	mapBlocksUsages(filePath: string, blocks: Record<string, Block>) {
		const usagesList = Object.values(blocks)
			.map((value) => {
				const { children = [], blocks = [] } = value

				const propsBlocks = Object.entries(value?.props ?? {}).reduce((acc, [pk, pv]) => {
					if (pk.match(/^[A-Z]/)) return [...acc, pv]
					return acc
				}, [] as string[])

				return [...children, ...blocks, ...propsBlocks]
			})
			.flat()

		this.fileUsagesMap.set(filePath, usagesList)
	}

	getPath(blockName: string) {
		return this.blocksMap.get(blockName) as string
	}

	getText(filePath: string) {
		return this.fileMap.get(filePath) as string
	}

	getBlockUsage(blockName: string) {
		const allUsedBlocks = Array.from(this.fileUsagesMap.values()).flat()
		return allUsedBlocks.some((blockUsage) => blockUsage === blockName)
	}

	getFileUsage(filePath: string) {
		return this.fileUsagesMap.get(filePath)
	}

	getAllBlocks() {
		const allBlocks = new Map<string, Block>()

		for (const filePath of this.fileMap.keys()) {
			const blocks = JSONC.parse(readFileSync(filePath, 'utf-8'))

			for (const [k, v] of Object.entries(blocks)) {
				allBlocks.set(k, v)
			}
		}

		return allBlocks
	}

	static getBlocksNames(s: string) {
		const blocks = []

		const matchs = [] as [number, string][]
		for (const i of s.matchAll(/(?<space>^( |\t)+)(?<text>".+(?=:))/gm)!) {
			const { space, text } = i.groups!

			matchs.push([space.length, text.slice(1, -1)])
		}

		const smaller = Math.min(...matchs.map(([k]) => k))
		for (const [k, v] of matchs) {
			if (k === smaller) {
				blocks.push(v)
			}
		}

		return blocks
	}
}
