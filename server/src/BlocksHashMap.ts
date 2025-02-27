import { readFileSync } from 'fs';
import { glob } from 'glob';
import * as JSONC from 'jsonc-parser';

export class BlocksHashMap {
	private rootPath: string;
	private blocksMap = new Map<string, string>();
	private blocksContentMap = new Map<string, BlockFormat>();
	private fileMap = new Map<string, string | Buffer>();
	private fileUsagesMap = new Map<string, string[]>();

	constructor(rootPath: string) {
		this.rootPath = rootPath.replace(/\\/g, '/');
		this.fillHashMap();
	}

	fillHashMap() {
		const filesPaths = glob.sync(`${this.rootPath}/**/*.{json,jsonc}`);
		const blocksFilesPaths = filesPaths.filter((filePath) => filePath.includes('blocks'));

		blocksFilesPaths.forEach((filePath) => this.mapBlocksOnFile(filePath));
	}

	mapBlocksOnFile(filePath: string, customText?: string) {
		const fileContent = customText || readFileSync(filePath);

		if (fileContent === '') return;

		try {
			const blocks: Record<string, BlockFormat> = JSONC.parse(fileContent.toString());

			Object.entries(blocks).forEach(([blockName, blockContent]) => {
				this.blocksMap.set(blockName, filePath);
				this.blocksContentMap.set(blockName, blockContent);
			});

			this.fileMap.set(filePath, fileContent);
			this.mapBlocksUsages(filePath, blocks);
		} catch (error) {
			console.log(`unable to parse file ${filePath}`);
		}
	}

	mapBlocksUsages(filePath: string, blocks: Record<string, BlockFormat>) {
		const usagesList = Object.values(blocks)
			.map((value) => {
				const { children = [], blocks = [] } = value;

				const propsBlocks = Object.entries(value?.props ?? {}).reduce(
					(acc, [propKey, propValue]) => {
						if (propKey.match(/^[A-Z]/)) return [...acc, propValue];
						return acc;
					},
					[] as string[]
				);

				return [...children, ...blocks, ...propsBlocks];
			})
			.flat();

		this.fileUsagesMap.set(filePath, usagesList);
	}

	getBlockFilePath(blockName: string) {
		return this.blocksMap.get(blockName) as string;
	}

	getFileContent(filePath: string) {
		return this.fileMap.get(filePath) as string;
	}

	listBlocks() {
		return this.blocksMap.entries();
	}

	getBlockUsage(blockName: string) {
		const allUsedBlocks = Array.from(this.fileUsagesMap.values()).flat();
		return allUsedBlocks.some((blockUsage) => blockUsage === blockName);
	}

	getBlockContent(blockName: string) {
		return this.blocksContentMap.get(blockName);
	}

	getFileUsage(filePath: string) {
		return this.fileUsagesMap.get(filePath);
	}
}
