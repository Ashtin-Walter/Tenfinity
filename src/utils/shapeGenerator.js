// src/utils/shapeGenerator.js

// Shape definitions with color mapping for better visual distinction
export const SHAPES = {
  easy: [
    { pattern: [[true, true], [true, true]], color: '#4285F4', name: 'square' },
    { pattern: [[true, true, true]], color: '#EA4335', name: 'line-3' },
    { pattern: [[true, true], [true, false]], color: '#FBBC05', name: 'L-small' },
    { pattern: [[true, true], [false, true]], color: '#34A853', name: 'reverse-L-small' },
    { pattern: [[true], [true], [true]], color: '#8E44AD', name: 'line-3-vertical' },
  ],
  normal: [
    { pattern: [[true, true, true], [false, true, false]], color: '#4285F4', name: 'T' },
    { pattern: [[true, true, true, true]], color: '#EA4335', name: 'line-4' },
    { pattern: [[true, false], [true, true], [false, true]], color: '#FBBC05', name: 'Z' },
    { pattern: [[false, true], [true, true], [true, false]], color: '#34A853', name: 'S' },
    { pattern: [[true, true], [true, false], [true, false]], color: '#8E44AD', name: 'L' },
    { pattern: [[true, true], [false, true], [false, true]], color: '#E67E22', name: 'reverse-L' },
    { pattern: [[true], [true], [true], [true]], color: '#1ABC9C', name: 'line-4-vertical' },
  ],
  hard: [
    { pattern: [[true, true, true], [true, false, false], [true, false, false]], color: '#4285F4', name: 'L-large' },
    { pattern: [[true, true, true], [false, false, true], [false, false, true]], color: '#EA4335', name: 'reverse-L-large' },
    { pattern: [[true, false, false], [true, true, true], [false, false, true]], color: '#FBBC05', name: 'snake' },
    { pattern: [[false, false, true], [true, true, true], [true, false, false]], color: '#34A853', name: 'reverse-snake' },
    { pattern: [[true, true, true, true], [false, true, false, false]], color: '#8E44AD', name: 'complex-1' },
    { pattern: [[true, true, true, true], [false, false, true, false]], color: '#E67E22', name: 'complex-2' },
    { pattern: [[true, true, false], [false, true, true], [false, false, true]], color: '#1ABC9C', name: 'complex-3' },
    { pattern: [[false, true, true], [true, true, false], [true, false, false]], color: '#3498DB', name: 'complex-4' },
    { pattern: [[true, true], [true, true], [true, false]], color: '#9B59B6', name: 'tetris-block' },
  ]
  // Extreme difficulty level with all shapes
  // No need to duplicate the shapes as we'll access them dynamically
};

// Get all shapes from all difficulty levels combined
const getAllShapes = () => {
  const allShapes = [];
  Object.keys(SHAPES).forEach(difficulty => {
    allShapes.push(...SHAPES[difficulty]);
  });
  return allShapes;
};

// LRU (Least Recently Used) Cache for rotation operations
class LRUCache {
  constructor(capacity = 50) {
    this.capacity = capacity;
    this.cache = new Map();
    this.recentlyUsed = [];
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    
    // Move to most recently used
    this.recentlyUsed = this.recentlyUsed.filter(k => k !== key);
    this.recentlyUsed.push(key);
    
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.recentlyUsed.length >= this.capacity && !this.cache.has(key)) {
      // Remove least recently used
      const lruKey = this.recentlyUsed.shift();
      this.cache.delete(lruKey);
    }
    
    // Add/update the cache
    this.cache.set(key, value);
    
    // Update recently used (remove first if exists)
    this.recentlyUsed = this.recentlyUsed.filter(k => k !== key);
    this.recentlyUsed.push(key);
  }
}

const rotationCache = new LRUCache(100);

const getCacheKey = (shape, times) => {
  // Using a more efficient cache key generation
  const pattern = JSON.stringify(shape.pattern || shape);
  return `${pattern}_${times % 4}`;
};

// Efficiently rotate a shape with a single-pass algorithm
const rotateShapeOnce = (matrix) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array(cols).fill().map(() => Array(rows).fill(false));
  
  // One pass 90° clockwise rotation
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      result[c][rows - 1 - r] = matrix[r][c];
    }
  }
  
  return result;
};

export const rotateShape = (shape, times = 1) => {
  // Fast path for no rotation or full rotation
  times = times % 4;
  if (times === 0) return shape;

  const pattern = shape.pattern || shape;
  const cacheKey = getCacheKey(shape, times);
  const cachedResult = rotationCache.get(cacheKey);
  
  if (cachedResult) {
    return shape.pattern 
      ? { ...shape, pattern: cachedResult } 
      : cachedResult;
  }
  
  // Optimize by using precalculated rotations for common angles
  let rotated;
  if (times === 2) {
    // 180° rotation can be done in one pass
    const rows = pattern.length;
    const cols = pattern[0].length;
    rotated = Array(rows).fill().map(() => Array(cols).fill(false));
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        rotated[rows - 1 - r][cols - 1 - c] = pattern[r][c];
      }
    }
  } else {
    // For 90° or 270°, use the rotateShapeOnce function
    rotated = pattern;
    for (let i = 0; i < times; i++) {
      rotated = rotateShapeOnce(rotated);
    }
  }
  
  rotationCache.set(cacheKey, rotated);
  
  // Return the appropriate shape format
  return shape.pattern 
    ? { ...shape, pattern: rotated } 
    : rotated;
};

export const getRandomShape = (difficulty = 'normal') => {
  const shapesForDifficulty = difficulty === 'extreme' ? getAllShapes() : SHAPES[difficulty] || SHAPES.normal;
  const randomIndex = Math.floor(Math.random() * shapesForDifficulty.length);
  const shape = shapesForDifficulty[randomIndex];
  
  // Apply random rotation (0, 90, 180, or 270 degrees)
  const rotations = Math.floor(Math.random() * 4);
  return rotateShape(shape, rotations);
};

// Balance shape distribution for better gameplay
export const getBalancedShapes = (count, difficulty = 'normal', previousShapes = []) => {
  const shapesForDifficulty = difficulty === 'extreme' ? getAllShapes() : SHAPES[difficulty] || SHAPES.normal;
  const result = [];
  
  // Keep track of shape types to ensure variety
  const usedShapeTypes = new Set(
    previousShapes
      .filter(s => s && s.name)
      .map(s => s.name)
  );
  
  for (let i = 0; i < count; i++) {
    // Try to get shapes that weren't used recently
    let attempts = 0;
    let shape;
    
    do {
      const randomIndex = Math.floor(Math.random() * shapesForDifficulty.length);
      shape = { ...shapesForDifficulty[randomIndex] };
      attempts++;
      
      // Apply random rotation (0, 90, 180, or 270 degrees)
      const rotations = Math.floor(Math.random() * 4);
      shape = rotateShape(shape, rotations);
      
      // After a few attempts, just take any shape
      if (attempts > 5) break;
    } while (usedShapeTypes.has(shape.name) && attempts < 5);
    
    usedShapeTypes.add(shape.name);
    result.push(shape);
  }
  
  return result;
};

// Utility function to trim empty rows and columns around a shape
export const trimShape = (shape) => {
  if (!shape) return shape;
  
  const pattern = shape.pattern || shape;
  if (!pattern || !pattern.length) return shape;
  
  // Find min/max rows and columns with filled cells
  let minRow = pattern.length;
  let maxRow = -1;
  let minCol = pattern[0].length;
  let maxCol = -1;
  
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r].length; c++) {
      if (pattern[r][c]) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }
  
  // If no filled cells found
  if (minRow > maxRow) return shape;
  
  // Create a new trimmed shape
  const trimmed = [];
  for (let r = minRow; r <= maxRow; r++) {
    const newRow = [];
    for (let c = minCol; c <= maxCol; c++) {
      newRow.push(pattern[r][c]);
    }
    trimmed.push(newRow);
  }
  
  // Return in the appropriate format
  return shape.pattern 
    ? { ...shape, pattern: trimmed } 
    : trimmed;
};

// Create a shape that's centered within a fixed-size matrix
export const centerShape = (shape, size = 5) => {
  const pattern = shape.pattern || shape;
  if (!pattern || !pattern.length) return shape;
  
  const rows = pattern.length;
  const cols = pattern[0].length;
  
  const startRow = Math.floor((size - rows) / 2);
  const startCol = Math.floor((size - cols) / 2);
  
  // Create empty matrix
  const centered = Array(size).fill().map(() => Array(size).fill(false));
  
  // Place the pattern in the center
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const newRow = startRow + r;
      const newCol = startCol + c;
      
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        centered[newRow][newCol] = pattern[r][c];
      }
    }
  }
  
  // Return in the appropriate format
  return shape.pattern 
    ? { ...shape, pattern: centered } 
    : centered;
};
