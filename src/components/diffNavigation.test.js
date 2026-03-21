import { describe, expect, it } from 'vitest';
import {
  findNextChangeIndex,
  findPreviousChangeIndex,
  getChangeLineNumber
} from './diffNavigation';

describe('diffNavigation', () => {
  const changes = [
    { modifiedStartLineNumber: 2 },
    { modifiedStartLineNumber: 7 },
    { originalStartLineNumber: 11 }
  ];

  it('returns fallback line number when no valid line exists', () => {
    expect(getChangeLineNumber()).toBe(1);
    expect(getChangeLineNumber({})).toBe(1);
  });

  it('finds next change index and wraps', () => {
    expect(findNextChangeIndex(changes, 1)).toBe(0);
    expect(findNextChangeIndex(changes, 2)).toBe(1);
    expect(findNextChangeIndex(changes, 20)).toBe(0);
  });

  it('finds previous change index and wraps', () => {
    expect(findPreviousChangeIndex(changes, 10)).toBe(1);
    expect(findPreviousChangeIndex(changes, 2)).toBe(2);
    expect(findPreviousChangeIndex(changes, 1)).toBe(2);
  });

  it('returns -1 for empty changes', () => {
    expect(findNextChangeIndex([], 1)).toBe(-1);
    expect(findPreviousChangeIndex([], 1)).toBe(-1);
  });
});
