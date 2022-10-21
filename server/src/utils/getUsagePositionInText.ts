export const getUsagePositionInText = (blockId: string, text: string) => {
	const lines = text.toString().split(/\r?\n/);

	const blockLineIndex = lines.findIndex(
		(line) => line.includes(`"${blockId}"`) && !line.includes(`"${blockId}":`)
	);

	const blockLine = lines[blockLineIndex];

	if (!blockLine) return undefined;

	const blockEndLineIndex = blockLineIndex;

	const blockDefinitionStartsAt = blockLine.indexOf(blockId) - 1;
	const blockDefinitionEndsAt = blockLine.indexOf(blockId) + blockId.length + 1;

	return {
		start: {
			line: blockLineIndex,
			character: blockDefinitionStartsAt
		},
		end: {
			line: blockEndLineIndex,
			character: blockDefinitionEndsAt
		}
	};
};
