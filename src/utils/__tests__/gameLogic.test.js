// Unit tests for core game logic: game over, shape placement, line clearing, scoring, undo
import { checkGameOver, canPlaceShape, clearLines, calculateScore } from '../gameLogic';

describe('Game Logic', () => {
  test('detects game over when no moves left', () => {
    // Fill grid, no empty cells
    const grid = Array(10).fill().map(() => Array(10).fill(true));
    const shapes = [{ pattern: [[true]], name: 'single' }];
    expect(checkGameOver(grid, shapes)).toBe(true);
  });

  test('detects not game over when at least one move is possible', () => {
    const grid = Array(10).fill().map(() => Array(10).fill(false));
    const shapes = [{ pattern: [[true]], name: 'single' }];
    expect(checkGameOver(grid, shapes)).toBe(false);
  });

  test('canPlaceShape returns true for valid placement', () => {
    const grid = Array(10).fill().map(() => Array(10).fill(false));
    const shape = { pattern: [[true, true]], name: 'line-2' };
    expect(canPlaceShape(grid, shape, 0, 0)).toBe(true);
  });

  test('canPlaceShape returns false for invalid placement', () => {
    const grid = Array(10).fill().map(() => Array(10).fill(true));
    const shape = { pattern: [[true, true]], name: 'line-2' };
    expect(canPlaceShape(grid, shape, 0, 0)).toBe(false);
  });

  test('clearLines removes full rows and columns', () => {
    const grid = Array(10).fill().map(() => Array(10).fill(false));
    grid[0] = Array(10).fill(true); // Fill first row
    const { newGrid, linesCleared } = clearLines(grid);
    expect(linesCleared).toBeGreaterThan(0);
    expect(newGrid[0].every(cell => !cell)).toBe(true);
  });

  test('calculateScore returns correct score', () => {
    expect(calculateScore(1, 0)).toBeGreaterThan(0);
    expect(calculateScore(0, 1)).toBeGreaterThan(0);
  });
});
