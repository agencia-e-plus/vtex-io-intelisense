type BlockFormat = {
	props?: {
		Then: string
		Else: string
		[key: string]: string
	}
	blocks?: string[]
	children?: string[]
}

type BlockItem = {
	[key: string]: BlockFormat
}
