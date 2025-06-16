// Tests for game logic utilities
import { 
  checkGameOver, 
  canPlaceAnywhereOnGrid, 
  canPlaceShape, 
  clearLines, 
  calculateScore 
} from '../gameLogic';

describe('Game Logic Utilities', () => {
  // Test grid setup
  const emptyGrid = Array(10).fill().map(() => Array(10).fill(false));
  const fullGrid = Array(10).fill().map(() => Array(10).fill(true));
  
  // Test shapes
  const singleBlock = { pattern: [[true]] };
  const twoByTwo = { pattern: [[true, true], [true, true]] };
  const longLine = { pattern: [[true, true, true, true, true]] };
  
  describe('canPlaceShape', () => {
    test('should return true for valid placement', () => {
      expect(canPlaceShape(emptyGrid, singleBlock, 0, 0)).toBe(true);
      expect(canPlaceShape(emptyGrid, twoByTwo, 5, 5)).toBe(true);
    });
    
    test('should return false for out of bounds placement', () => {
      expect(canPlaceShape(emptyGrid, twoByTwo, 9, 9)).toBe(false);
      expect(canPlaceShape(emptyGrid, longLine, 0, 6)).toBe(false);
    });
    
    test('should return false for collision with existing blocks', () => {
      const partialGrid = [...emptyGrid];
      partialGrid[0][0] = true;
      
      expect(canPlaceShape(partialGrid, twoByTwo, 0, 0)).toBe(false);
      expect(canPlaceShape(partialGrid, singleBlock, 0, 0)).toBe(false);
    });
    
    test('should handle null or invalid shapes', () => {
      expect(canPlaceShape(emptyGrid, null, 0, 0)).toBe(false);
      expect(canPlaceShape(emptyGrid, {}, 0, 0)).toBe(false);
      expect(canPlaceShape(emptyGrid, { pattern: [] }, 0, 0)).toBe(false);
    });
  });
  
  describe('canPlaceAnywhereOnGrid', () => {
    test('should return true if shape can be placed somewhere', () => {
      expect(canPlaceAnywhereOnGrid(emptyGrid, singleBlock)).toBe(true);
      
      const almostFullGrid = fullGrid.map(row => [...row]);
      almostFullGrid[0][0] = false;
      expect(canPlaceAnywhereOnGrid(almostFullGrid, singleBlock)).toBe(true);
    });
    
    test('should return false if shape cannot be placed anywhere', () => {
      expect(canPlaceAnywhereOnGrid(fullGrid, singleBlock)).toBe(false);
      expect(canPlaceAnywhereOnGrid(fullGrid, twoByTwo)).toBe(false);
    });
    
    test('should handle null or invalid shapes', () => {
      expect(canPlaceAnywhereOnGrid(emptyGrid, null)).toBe(false);
      expect(canPlaceAnywhereOnGrid(emptyGrid, {})).toBe(false);
      expect(canPlaceAnywhereOnGrid(emptyGrid, { pattern: [] })).toBe(false);
    });
  });
  
  describe('checkGameOver', () => {
    test('should return true when no shapes can be placed', () => {
      expect(checkGameOver(fullGrid, [singleBlock, twoByTwo])).toBe(true);
    });
    
    test('should return false when at least one shape can be placed', () => {
      expect(checkGameOver(emptyGrid, [singleBlock, twoByTwo])).toBe(false);
    });
    
    test('should return false during animations', () => {
      expect(checkGameOver(fullGrid, [singleBlock], true, false)).toBe(false);
      expect(checkGameOver(fullGrid, [singleBlock], false, true)).toBe(false);
    });
    
    test('should handle null shapes correctly', () => {
      expect(checkGameOver(emptyGrid, [null, null])).toBe(false);
      expect(checkGameOver(emptyGrid, [])).toBe(true);
      expect(checkGameOver(emptyGrid, null)).toBe(true);
    });
  });
});