export const getChangeLineNumber = (change) => {
  if (!change) return 1;
  return change.modifiedStartLineNumber || change.originalStartLineNumber || 1;
};

export const findNextChangeIndex = (lineChanges, currentLine) => {
  if (lineChanges.length === 0) return -1;

  for (let i = 0; i < lineChanges.length; i++) {
    if (getChangeLineNumber(lineChanges[i]) > currentLine) {
      return i;
    }
  }

  return 0;
};

export const findPreviousChangeIndex = (lineChanges, currentLine) => {
  if (lineChanges.length === 0) return -1;

  for (let i = lineChanges.length - 1; i >= 0; i--) {
    if (getChangeLineNumber(lineChanges[i]) < currentLine) {
      return i;
    }
  }

  return lineChanges.length - 1;
};
