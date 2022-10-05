export const getBlockPositionInText = (blockId: string, text: string) => {
  const lines = text.toString().split(/\r?\n/);

  const blockLineIndex = lines.findIndex((line) => line.includes(`"${blockId}":`));
  const blockLine = lines[blockLineIndex];

  if (!blockLine) return undefined;

  let openBreakers = 1;
  let closeBreakers = 0;
  let blockEndLineIndex = blockLineIndex;

  while (openBreakers !== closeBreakers) {
    const nextLine = lines[blockEndLineIndex + 1];

    if (!nextLine) return undefined;
    if (blockLine?.includes("}")) closeBreakers++;
    if (nextLine.includes("{")) openBreakers++;
    if (nextLine.includes("}")) closeBreakers++;

    blockEndLineIndex++;
  }

  const endLine = lines[blockEndLineIndex];

  const blockDefinitionStartsAt = blockLine.indexOf(blockId) - 1;
  const blockDefinitionEndsAt = endLine.length;

  return {
    start: {
      line: blockLineIndex,
      character: blockDefinitionStartsAt,
    },
    end: {
      line: blockEndLineIndex,
      character: blockDefinitionEndsAt,
    },
  };
};
