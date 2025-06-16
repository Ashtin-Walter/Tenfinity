// Centralized pure utility functions for game logic
// These should be used by App.js and tested in isolation

/**
 * Checks if the game is over (no moves left for any shape)
 * @param {Array<Array<boolean>>} grid - The current game grid
 * @param {Array<Object>} shapes - Array of available shapes
 * @param {boolean} isLineCleared - Whether lines are currently being cleared
 * @param {boolean} isRefreshingShapes - Whether shapes are being refreshed
 * @returns {boolean} - True if game is over, false otherwise
 */
export function checkGameOver(grid, shapes, isLineCleared = false, isRefreshingShapes = false) {
  // Don't check for game over during animations or when refreshing shapes
  if (isLineCleared || isRefreshingShapes) return false;
  
  // Game is over if there are no shapes available
  if (!shapes || !Array.isArray(shapes) || shapes.length === 0) return true;
  
  // Game is not over if there are null shapes (waiting for refresh)
  if (shapes.every(shape => shape === null)) return false;
  
  // Check if any non-null shape can be placed
  const validShapes = shapes.filter(shape => shape !== null);
  if (validShapes.length === 0) return false;
  
  // Check if any shape can be placed anywhere on the grid
  return !validShapes.some(shape => canPlaceAnywhereOnGrid(grid, shape));
}

/**
 * Optimized function to check if a shape can be placed anywhere on the grid
 * @param {Array<Array<boolean>>} grid - The current game grid
 * @param {Object} shape - The shape to check
 * @returns {boolean} - True if the shape can be placed, false otherwise
 */
export function canPlaceAnywhereOnGrid(grid, shape) {
  if (!shape) return false;
  
  const pattern = shape.pattern || shape;
  if (!pattern || !Array.isArray(pattern) || pattern.length === 0) return false;
  
  const gridSize = grid.length;
  const patternHeight = pattern.length;
  const patternWidth = pattern[0].length;
  
  // Early exit if shape is larger than grid
  if (patternHeight > gridSize || patternWidth > gridSize) return false;
  
  // Check each possible position on the grid
  for (let row = 0; row <= gridSize - patternHeight; row++) {
    for (let col = 0; col <= gridSize - patternWidth; col++) {
      if (canPlaceShape(grid, shape, row, col)) return true;
    }
  }
  
  return false;
}

/**
 * Checks if a shape can be placed at a given position
 * @param {Array<Array<boolean>>} grid - The current game grid
 * @param {Object} shape - The shape to check
 * @param {number} row - Starting row position
 * @param {number} col - Starting column position
 * @returns {boolean} - True if the shape can be placed, false otherwise
 */
export function canPlaceShape(grid, shape, row, col) {
  if (!shape) return false;
  
  const pattern = shape.pattern || shape;
  if (!pattern || !Array.isArray(pattern) || pattern.length === 0) return false;
  
  const gridSize = grid.length;
  const patternHeight = pattern.length;
  const patternWidth = pattern[0].length;
  
  // Check bounds
  if (row < 0 || col < 0 || row + patternHeight > gridSize || col + patternWidth > gridSize) {
    return false;
  }
  
  // Check for collisions with existing blocks
  for (let r = 0; r < patternHeight; r++) {
    for (let c = 0; c < patternWidth; c++) {
      if (pattern[r][c] && grid[row + r][col + c]) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Clears full rows and columns, returns new grid and number of lines cleared
 * @param {Array<Array<boolean>>} grid - The current game grid
 * @returns {Object} - Object containing new grid and number of lines cleared
 */
export function clearLines(grid) {
  if (!grid || !Array.isArray(grid) || grid.length === 0) {
    return { newGrid: grid, linesCleared: 0 };
  }
  
  const size = grid.length;
  let linesCleared = 0;
  let newGrid = grid.map(row => row.slice());

  // Check rows
  for (let r = 0; r < size; r++) {
    if (newGrid[r].every(cell => cell)) {
      newGrid[r] = Array(size).fill(false);
      linesCleared++;
    }
  }
  
  // Check columns
  for (let c = 0; c < size; c++) {
    if (newGrid.every(row => row[c])) {
      for (let r = 0; r < size; r++) newGrid[r][c] = false;
      linesCleared++;
    }
  }
  
  return { newGrid, linesCleared };
}

/**
 * Calculates score based on lines cleared and shapes placed
 * @param {number} linesCleared - Number of lines cleared
 * @param {number} shapesPlaced - Number of shapes placed
 * @returns {number} - Calculated score
 */
export function calculateScore(linesCleared, shapesPlaced) {
  // Ensure parameters are valid numbers
  const lines = Number(linesCleared) || 0;
  const shapes = Number(shapesPlaced) || 0;
  
  // Bonus points for clearing multiple lines at once
  let bonus = 0;
  if (lines >= 2) bonus = lines * 20;
  if (lines >= 4) bonus = lines * 50;
  
  return lines * 100 + shapes * 10 + bonus;
}
