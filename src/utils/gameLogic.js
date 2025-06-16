// Centralized pure utility functions for game logic
// These should be used by App.js and tested in isolation

/**
 * Checks if the game is over (no moves left for any shape)
 */
export function checkGameOver(grid, shapes) {
  if (!shapes || shapes.length === 0) return true;
  for (const shape of shapes) {
    for (let row = 0; row <= grid.length - shape.pattern.length; row++) {
      for (let col = 0; col <= grid[0].length - shape.pattern[0].length; col++) {
        if (canPlaceShape(grid, shape, row, col)) return false;
      }
    }
  }
  return true;
}

/**
 * Checks if a shape can be placed at a given position
 */
export function canPlaceShape(grid, shape, row, col) {
  for (let r = 0; r < shape.pattern.length; r++) {
    for (let c = 0; c < shape.pattern[0].length; c++) {
      if (shape.pattern[r][c]) {
        if (
          row + r >= grid.length ||
          col + c >= grid[0].length ||
          grid[row + r][col + c]
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Clears full rows and columns, returns new grid and number of lines cleared
 */
export function clearLines(grid) {
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
 */
export function calculateScore(linesCleared, shapesPlaced) {
  return linesCleared * 100 + shapesPlaced * 10;
}
