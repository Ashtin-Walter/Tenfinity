import React, { useState, useEffect, useCallback, useRef } from 'react';
import GridBoard from './components/GridBoard';
import NextShapes from './components/NextShapes';
import GameOver from './components/GameOver';
import ScoreBoard from './components/ScoreBoard';
import SettingsMenu from './components/SettingsMenu';
import { getBalancedShapes, rotateShape } from './utils/shapeGenerator';
import './App.css';
import Shape from './components/Shape';
// import ShapeGenerator from './components/ShapeGenerator';

const GRID_SIZE = 10; // added constant GRID_SIZE
const TOUCH_Y_OFFSET = 100; // Constant for touch Y offset

// Utility function to generate an empty grid
const generateEmptyGrid = () => Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));

// Utility function to generate an empty color grid
const generateEmptyColorGrid = () => Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));

// Modified utility function to always update grid state and trigger animation when lines are cleared
const checkForCompletedLines = (grid, colorGrid, setScore, setGrid, setColorGrid, setIsLineCleared, gridElement) => {
  let linesCleared = 0;
  const completedRows = [];
  const completedCols = [];

  // Find completed rows
  grid.forEach((row, i) => {
    if (row.every(cell => cell)) {
      completedRows.push(i);
      linesCleared++;
    }
  });

  // Find completed columns
  for (let col = 0; col < GRID_SIZE; col++) {
    let isComplete = true;
    for (let row = 0; row < GRID_SIZE; row++) {
      if (!grid[row][col]) {
        isComplete = false;
        break;
      }
    }
    if (isComplete) {
      completedCols.push(col);
      linesCleared++;
    }
  }

  if (linesCleared > 0) {
    const newGrid = grid.map(row => [...row]);
    const newColorGrid = colorGrid.map(row => [...row]);

    if (gridElement) {
      // Apply initial 'cell-cleared' animation
      completedRows.forEach(rowIndex => {
        for (let col = 0; col < GRID_SIZE; col++) {
          const cellElement = gridElement.querySelector(`.grid-cell-container[data-row="${rowIndex}"][data-col="${col}"] .grid-cell`);
          if (cellElement) {
            cellElement.classList.add('cell-cleared');
          }
        }
      });

      completedCols.forEach(colIndex => {
        for (let row = 0; row < GRID_SIZE; row++) {
          const cellElement = gridElement.querySelector(`.grid-cell-container[data-row="${row}"][data-col="${colIndex}"] .grid-cell`);
          if (cellElement) {
            cellElement.classList.add('cell-cleared');
          }
        }
      });
    }

    // Delay for initial highlight animation to play
    setTimeout(() => {
      if (!gridElement) return; // Check gridElement at the start of timeout

      // Apply 'cell-disappear' animation
      completedRows.forEach(rowIndex => {
        for (let col = 0; col < GRID_SIZE; col++) {
          const cellElement = gridElement.querySelector(`.grid-cell-container[data-row="${rowIndex}"][data-col="${col}"] .grid-cell`);
          if (cellElement) {
            cellElement.classList.remove('cell-cleared'); // Remove highlight
            cellElement.classList.add('cell-disappear'); // Add disappear animation
          }
        }
      });

      completedCols.forEach(colIndex => {
        for (let row = 0; row < GRID_SIZE; row++) {
          const cellElement = gridElement.querySelector(`.grid-cell-container[data-row="${row}"][data-col="${colIndex}"] .grid-cell`);
          if (cellElement) {
            cellElement.classList.remove('cell-cleared'); // Remove highlight
            cellElement.classList.add('cell-disappear'); // Add disappear animation
          }
        }
      });

      // Delay clearing the grid data to allow disappear animation to play
      setTimeout(() => {
        completedRows.forEach(rowIndex => {
          newGrid[rowIndex] = Array(GRID_SIZE).fill(false);
          newColorGrid[rowIndex] = Array(GRID_SIZE).fill(null);
          if (gridElement) {
            for (let col = 0; col < GRID_SIZE; col++) {
              const cellElement = gridElement.querySelector(`.grid-cell-container[data-row="${rowIndex}"][data-col="${col}"] .grid-cell`);
              if (cellElement) {
                cellElement.classList.remove('cell-disappear'); // Clean up class
              }
            }
          }
        });

        completedCols.forEach(colIndex => {
          for (let row = 0; row < GRID_SIZE; row++) {
            newGrid[row][colIndex] = false;
            newColorGrid[row][colIndex] = null;
            if (gridElement) {
              const cellElement = gridElement.querySelector(`.grid-cell-container[data-row="${row}"][data-col="${colIndex}"] .grid-cell`);
              if (cellElement) {
                cellElement.classList.remove('cell-disappear'); // Clean up class
              }
            }
          }
        });        setGrid(newGrid);
        setColorGrid(newColorGrid);
        setScore(prevScore => prevScore + linesCleared * 10);
        setIsLineCleared(true); // Activate loader-logo animation

        // Reset loader-logo animation after it plays AND ensure game over check can run
        // Use a longer delay to ensure React state updates have completed
        setTimeout(() => {
          console.log('Line clearing completely finished - allowing game over check');
          setIsLineCleared(false);
        }, 1600); // Slightly longer to ensure all state updates have processed

      }, 500); // Duration of cell-disappear animation (must match CSS)

    }, 300); // Duration of cell-cleared animation (must match CSS)
  }
};

// Enhanced placement check: test all four rotations of each shape
const canPlaceShape = (grid, shape) => {
  if (!shape) return false;
  const pattern = shape.pattern || shape;
  if (!Array.isArray(pattern) || !pattern.length || !pattern[0].length) return false;

  for (let rot = 0; rot < 4; rot++) {
    const rotated = rotateShape(shape, rot);
    const pat = rotated.pattern || rotated;
    const patH = pat.length;
    const patW = pat[0].length;

    for (let row = 0; row <= GRID_SIZE - patH; row++) {
      for (let col = 0; col <= GRID_SIZE - patW; col++) {
        if (canPlaceAt(grid, pat, row, col)) return true;
      }
    }
  }
  return false;
};

function canPlaceAt(grid, pattern, startRow, startCol) {
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[0].length; x++) {
      if (pattern[y][x] && grid[startRow + y][startCol + x]) {
        return false;
      }
    }
  }
  return true;
}

// Helper function to check if shape can be placed at specific position
function canPlaceShapeAt(grid, shape, startRow, startCol) {
  if (!shape) return false;
  const pattern = shape.pattern || shape;
  const patH = pattern.length;
  const patW = pattern[0].length;
  // Check bounds
  if (startRow + patH > GRID_SIZE || startCol + patW > GRID_SIZE) {
    return false;
  }
  // Check for collisions
  for (let y = 0; y < patH; y++) {
    for (let x = 0; x < patW; x++) {
      if (pattern[y][x] && grid[startRow + y][startCol + x]) {
        return false;
      }
    }
  }
  return true;
}

const App = () => {
  const [grid, setGrid] = useState(generateEmptyGrid);
  const [colorGrid, setColorGrid] = useState(generateEmptyColorGrid);
  const [shapes, setShapes] = useState(() => getBalancedShapes(3, 'extreme'));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = parseInt(localStorage.getItem('highScore'), 10);
    return isNaN(saved) ? 0 : saved;
  });
  const [difficulty, setDifficulty] = useState('extreme');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default'); // new state for theme
  const [draggingShape, setDraggingShape] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null); // new state for click-to-place interaction
  const [previewPos, setPreviewPos] = useState(null);
  const [dragPosition, setDragPosition] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // new state for menu toggle
  const [gameOver, setGameOver] = useState(false); // new state for game over
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const [isTutorialOpen, setIsTutorialOpen] = useState(() => !localStorage.getItem('tutorialSeen'));  const [isLineCleared, setIsLineCleared] = useState(false); // new state to track line clearing
  const [isRefreshingShapes, setIsRefreshingShapes] = useState(false); // new state to track shape refreshing
  const [prevGameState, setPrevGameState] = useState(null); // for undo

  // Refs for touch handling and other direct DOM manipulations
  const touchTimeoutRef = useRef(null);
  const lastTouchPosRef = useRef(null);
  const touchStartTimeRef = useRef(0);
  const gridRef = useRef(null); // Ref for the grid board container

  const changeDifficulty = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
    // Restart game when difficulty changes
    setGrid(generateEmptyGrid());
    setColorGrid(generateEmptyColorGrid());
    setShapes(getBalancedShapes(3, newDifficulty));
    setScore(0);
    setGameOver(false);
  }, []);

  const getNextShapes = useCallback(() => {
    // Get a balanced set of shapes with the current difficulty
    return getBalancedShapes(3, difficulty, shapes); // shapes dependency might cause frequent re-creation if shapes array identity changes often
  }, [difficulty, shapes]); 

  const restartGame = useCallback(() => {
    setGrid(generateEmptyGrid());
    setColorGrid(generateEmptyColorGrid());
    // Use difficulty-aware shape generation
    setShapes(getBalancedShapes(3, difficulty));
    setScore(0);
    setGameOver(false);
    setMenuOpen(false);
  }, [difficulty]);

  // Utility to restore previous game state
  const handleUndo = useCallback(() => {
    if (!prevGameState) return;
    const { grid: g, colorGrid: c, shapes: s, score: sc } = prevGameState;
    setGrid(g);
    setColorGrid(c);
    setShapes(s);
    setScore(sc);
    setPrevGameState(null);
  }, [prevGameState]);

  // Memoize placeShapeOnGrid to prevent re-creation if dependencies haven't changed
  const placeShapeOnGrid = useCallback((shape, startX, startY) => {
    if (!shape) {
      console.error('Attempted to place a null or undefined shape.');
      return false;
    }
    // Save current state for undo before making changes
    setPrevGameState({ grid, colorGrid, shapes, score }); 

    const newGrid = grid.map(row => [...row]);
    const newColorGrid = colorGrid.map(row => [...row]);
    const newlyPlacedCells = [];
    
    const pattern = shape.pattern || shape;
    const color = shape.color || 'var(--accent-color)';

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x]) {
          const gridY = startY + y;
          const gridX = startX + x;

          if (
            gridY >= 0 &&
            gridY < GRID_SIZE &&
            gridX >= 0 &&
            gridX < GRID_SIZE &&
            !newGrid[gridY][gridX] // Simplified condition: only place if cell is empty
          ) {
            newGrid[gridY][gridX] = true;
            newColorGrid[gridY][gridX] = color;
            newlyPlacedCells.push({ row: gridY, col: gridX });
          } else {
            // Invalid placement (out of bounds or collision)
            return false; 
          }
        }
      }
    }

    setGrid(newGrid);
    setColorGrid(newColorGrid);
    
    // Animate newly placed cells
    // Consider moving DOM manipulation to a useEffect hook if it becomes complex
    setTimeout(() => {
      newlyPlacedCells.forEach(({row, col}) => {
        // Use gridRef for a more stable querySelector context if possible
        const cellElement = gridRef.current ? gridRef.current.querySelector(`.grid-cell-container[data-row="${row}"][data-col="${col}"] .grid-cell`) : null;
        if (cellElement) {
          cellElement.classList.add('newly-placed');
          setTimeout(() => {
            cellElement.classList.remove('newly-placed');
          }, 800);
        }
      });
    }, 10);

    // Check for completed lines
    // Pass the updated grid and colorGrid directly to avoid stale closures
    setTimeout(() => {
      checkForCompletedLines(newGrid, newColorGrid, setScore, setGrid, setColorGrid, setIsLineCleared, gridRef.current);
    }, 400);

    return true;
  }, [grid, colorGrid, shapes, score, setPrevGameState, setGrid, setColorGrid, setScore, setIsLineCleared, gridRef]); // Added gridRef to dependencies

  // --- GAME OVER CHECK ---
const checkGameOver = useCallback(() => {
  if (gameOver) return false;
  // If no shapes left or all are null/empty, game is over
  if (!shapes || shapes.length === 0 || shapes.every(s => !s)) {
    setGameOver(true);
    return true;
  }
  // If none of the shapes can be placed, game is over
  const anyCanPlace = shapes.some(s => s && canPlaceShape(grid, s));
  if (!anyCanPlace) {
    setGameOver(true);
    return true;
  }
  return false;
}, [gameOver, shapes, grid]);

  const handleDrop = useCallback((e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!previewPos || !draggingShape) return;
    
    const { row: rowIndex, col: cellIndex } = previewPos;
    const success = placeShapeOnGrid(draggingShape.shape, cellIndex, rowIndex);
    if (!success) {
      navigator.vibrate?.(200); // Vibrate on failed placement
      return;    }
    
    // Success case
    const newShapes = shapes.filter((s, i) => i !== draggingShape.index); // Use filter for a new array
    if (newShapes.every(s => s === null) || newShapes.length === 0) { // Check if all remaining are null or array is empty
      console.log('Shape placement: All shapes used, refreshing...');
      setIsRefreshingShapes(true);
      // Use Promise.resolve to ensure this happens after current state updates
      Promise.resolve().then(() => {
        setTimeout(() => {
          console.log('Shape placement: Refreshing shapes with new set');
          setShapes(getNextShapes());
          setIsRefreshingShapes(false);
          console.log('Shape placement: Shape refreshing complete');
        }, 10);
      });
    } else {
      console.log('Shape placement: Shapes remaining, filtering used shape');
      setShapes(newShapes);
      // --- GAME OVER CHECK after shape placement if shapes are empty or none can be placed ---
      setTimeout(() => {
        checkGameOver();
      }, 20);
    }
    
    // Visual feedback for successful placement
    // Consider using a state variable to toggle class if direct DOM manipulation becomes problematic
    const gridElement = gridRef.current; // Use ref
    if (gridElement) {
      gridElement.classList.add('shape-placed');
      setTimeout(() => {
        gridElement.classList.remove('shape-placed');
      }, 300);
    }
      setDraggingShape(null);
    setPreviewPos(null);
  }, [previewPos, draggingShape, shapes, placeShapeOnGrid, getNextShapes, gridRef, checkGameOver]); // Added checkGameOver

  // Click on a grid cell when a shape is selected
  const handleCellClick = useCallback((rowIndex, colIndex) => {
    if (!selectedShape) return;
    
    const success = placeShapeOnGrid(selectedShape.shape, colIndex, rowIndex);
    if (!success) {
      navigator.vibrate?.(200);
      return;
    }
    
    const newShapes = shapes.filter((s, i) => i !== selectedShape.index); // Use filter
    if (newShapes.every(s => s === null) || newShapes.length === 0) {
      setIsRefreshingShapes(true);
      Promise.resolve().then(() => {
        setTimeout(() => {
          setShapes(getNextShapes());
          setIsRefreshingShapes(false);
        }, 10);
      });
    } else {
      setShapes(newShapes);
      // --- GAME OVER CHECK after shape placement if shapes are empty or none can be placed ---
      setTimeout(() => {
        checkGameOver();
      }, 20);
    }
    
    const gridElement = gridRef.current; // Use ref
    if (gridElement) {
      gridElement.classList.add('shape-placed');
      setTimeout(() => {
        gridElement.classList.remove('shape-placed');
      }, 300);
    }    setSelectedShape(null);
    setDraggingShape(null);
    setPreviewPos(null);
  }, [selectedShape, placeShapeOnGrid, shapes, getNextShapes, gridRef, checkGameOver]); // Added gridRef

  // Touch move handler - optimized for better performance and visual feedback
  const handleTouchMove = useCallback((e) => {
    if (draggingShape) {
      e.preventDefault(); // Prevent scroll only when dragging
    }
    const touch = e.touches[0];
    if (!touch) return;

    lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY, timestamp: Date.now() };

    // Optimized elementFromPoint usage
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const rect = gridElement.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = (touch.clientY - TOUCH_Y_OFFSET) - rect.top; // Apply offset before calculating relative position

    // Calculate approximate cell based on touch position relative to the grid container
    const col = Math.floor(x / (rect.width / GRID_SIZE));
    const row = Math.floor(y / (rect.height / GRID_SIZE));

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      // Only update preview if position changed and add placement validation
      if (!previewPos || previewPos.row !== row || previewPos.col !== col) {
        const canPlace = draggingShape ? canPlaceShapeAt(grid, draggingShape.shape, row, col) : true;
        setPreviewPos({ row, col, canPlace });
      }
    } else {
      setPreviewPos(null);
    }

    if (draggingShape) {
      setDragPosition({ x: touch.clientX, y: touch.clientY });
    }
  }, [draggingShape, gridRef, previewPos, canPlaceShapeAt]); // Added dependencies

  // Touch end handler
  const handleTouchEnd = useCallback((e) => {
    const touchDuration = Date.now() - touchStartTimeRef.current;
    const wasShortTouch = touchDuration < 300;
    
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Use last valid previewPos if available, otherwise calculate from last touch point
    if (!previewPos && lastTouchPosRef.current) {
      const gridElement = gridRef.current;
      if (gridElement) {
        const rect = gridElement.getBoundingClientRect();
        const x = lastTouchPosRef.current.x - rect.left;
        const y = (lastTouchPosRef.current.y - TOUCH_Y_OFFSET) - rect.top;
        const col = Math.floor(x / (rect.width / GRID_SIZE));
        const row = Math.floor(y / (rect.height / GRID_SIZE));

        if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
          setPreviewPos({ row, col }); // Set previewPos right before handleDrop
        } else {
          setPreviewPos(null);
        }
      }
    } // This block ensures previewPos is set based on the final touch position before calling handleDrop
    
    handleDrop(); // handleDrop will use the latest previewPos
    
    if (!wasShortTouch || !selectedShape) {
      setDraggingShape(null);
      // setPreviewPos(null); // previewPos is reset by handleDrop or if placement fails
    }
    
    lastTouchPosRef.current = null;
    document.body.classList.remove('touching');
    setDragPosition(null);
  }, [handleDrop, selectedShape, gridRef, previewPos]); // Added gridRef and previewPos

  // Touch start handler
  const handleTouchStart = useCallback((e, index, shape) => {
    // Only prevent default if we're interacting with a shape
    // This allows normal scrolling when not dragging
    if (index !== undefined && shape) {
      e.preventDefault();
    }
    
    touchStartTimeRef.current = Date.now();
    
    // Clear any existing touch timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Capture initial touch position with timestamp for better tracking
    if (e.touches && e.touches[0]) {
      lastTouchPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        timestamp: Date.now()
      };
    }
    
    // If a shape index is provided, we're starting to drag a shape
    if (index !== undefined && shape) {
      setDraggingShape({ index, shape });
      // Add a class to indicate active dragging for visual feedback
      document.body.classList.add('touching');

      // initialize drag position overlay
      if (e.touches && e.touches[0]) setDragPosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  }, []);

  // Click on a shape to select it
  const handleShapeClick = useCallback((index, shape) => {
    // If the shape is already selected, deselect it
    if (selectedShape && selectedShape.index === index) {
      setSelectedShape(null);
      setDraggingShape(null);
    } else {
      // Otherwise, select this shape
      setSelectedShape({ index, shape });
      setDraggingShape({ index, shape }); // Use same format as dragging for preview
    }
  }, [selectedShape]);

  // Mouse move over grid for preview (desktop) - optimized with throttling
  const handleGridMouseMove = useCallback((e) => {
    if (!selectedShape || !gridRef.current) return;

    const gridElement = gridRef.current;
    const rect = gridElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / (rect.width / GRID_SIZE));
    const row = Math.floor(y / (rect.height / GRID_SIZE));

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      // Only update if position actually changed to reduce re-renders
      if (!previewPos || previewPos.row !== row || previewPos.col !== col) {
        // Check if shape can be placed at this position before showing preview
        const canPlace = canPlaceShapeAt(grid, selectedShape.shape, row, col);
        setPreviewPos({ row, col, canPlace });
      }
    } else {
      if (previewPos !== null) {
        setPreviewPos(null); // Clear preview if outside grid
      }    }
  }, [selectedShape, gridRef, previewPos, canPlaceShapeAt]);

  // Deselect shape on outside click
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!selectedShape) return;
      
      const gridBoardElement = gridRef.current;
      const shapesContainerElement = document.querySelector('.shapes-container'); // Assuming this selector is stable

      if (gridBoardElement && !gridBoardElement.contains(e.target) && 
          shapesContainerElement && !shapesContainerElement.contains(e.target)) {
        setSelectedShape(null);
        setDraggingShape(null);
        setPreviewPos(null);
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [selectedShape, gridRef]); // Added gridRef

  // Resize and orientation change handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsLandscape(window.innerHeight < window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Touch event listeners for mobile
  useEffect(() => {
    if (isMobile) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
      // Add touchmove listener to gridRef for optimized mobile dragging if preferred
      // gridRef.current?.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
        // gridRef.current?.removeEventListener('touchmove', handleTouchMove);
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      };
    }
  }, [isMobile, handleTouchMove, handleTouchEnd]); // Removed gridRef from dependencies

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        restartGame();
      } else if (e.key === 'h' || e.key === 'H') {
        setIsTutorialOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [restartGame]);

  // Cleanup touching class (already seems fine)
  useEffect(() => {
    const cleanupTouching = () => {
      document.body.classList.remove('touching');
    };
    
    window.addEventListener('touchend', cleanupTouching);
    window.addEventListener('touchcancel', cleanupTouching);
    
    return () => {
      window.removeEventListener('touchend', cleanupTouching);
      window.removeEventListener('touchcancel', cleanupTouching);
    };
  }, []);

  // Drag over grid cell (desktop)
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    // Optimized: direct calculation if possible, or ensure e.currentTarget is the cell itself
    const cellElement = e.currentTarget; 
    const row = Number(cellElement.dataset.row);
    const col = Number(cellElement.dataset.col);

    if (!isNaN(row) && !isNaN(col)) {
      if (!previewPos || previewPos.row !== row || previewPos.col !== col) {
         setPreviewPos({ row, col });
      }
    }
  }, [previewPos]); // Added previewPos

  // Drag leave grid cell (desktop)
  const handleDragLeave = useCallback((e) => {
    // Only set to null if the mouse truly left the grid area, 
    // not just moving between cells. This might need more sophisticated logic
    // or rely on handleGridMouseMove for clearing.
    // For simplicity, current behavior is kept, but could be refined.
    // setPreviewPos(null); 
  }, []); // Removed previewPos from deps as it's not used to set state here
  // Drag start from shape preview (desktop)
  const handleDragStart = useCallback((e, index, shape) => {
    setDraggingShape({ index, shape });
    
    // For compatibility with native HTML5 drag and drop
    // We need to stringify the shape including its color
    e.dataTransfer.setData('shape', JSON.stringify(shape));
  }, []);
  // High score update effect
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score);
    }
  }, [gameOver, score, highScore]);

  // Dark mode effect
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Theme effect
  useEffect(() => {
    document.body.classList.toggle('theme-modern', theme === 'modern');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prevMode => !prevMode);
  }, []);

  // Change theme
  const changeTheme = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  // Save game state
  const saveGame = useCallback(() => {
    const gameState = {
      grid,
      colorGrid,
      shapes,
      score,
      difficulty
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [grid, colorGrid, shapes, score, difficulty]);

  // Load game state
  const loadGame = useCallback(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const { grid, colorGrid, shapes, score, difficulty } = JSON.parse(savedState);
        setGrid(grid);
        // If no colorGrid in saved state, generate a new one
        setColorGrid(colorGrid || generateEmptyColorGrid());
        setShapes(shapes);
        setScore(score);
        setDifficulty(difficulty);
      } catch (error) {
        console.error("Error loading game state:", error);
        // Fall back to a new game
        restartGame();
      }
    }
  }, [restartGame]);

  // Menu open/close handlers
  const handleMenuOpen = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Effect for isLineCleared (already optimized)
  useEffect(() => {
    if (isLineCleared) {
      // This log helps confirm the state change and animation trigger.
      console.log('isLineCleared is true, loader-logo animation should start.');
      // DO NOT set isLineCleared to false here.
      // It is correctly reset by a setTimeout within the checkForCompletedLines function
      // after the animation duration.
    }
  }, [isLineCleared]);  // Game over detection - only check when line clearing is complete
  useEffect(() => {
    // Only check for game over when:
    // 1. Not currently clearing lines (animation complete)
    // 2. Not currently refreshing shapes 
    // 3. Game is not already over
    // 4. We have shapes to check AND they are not empty/null
    if (!isLineCleared && !isRefreshingShapes && !gameOver && shapes.length > 0 && shapes.some(s => s !== null)) {
      // Check if any shape can be placed on the current grid
      const anyMovePossible = shapes.some(shape => shape && canPlaceShape(grid, shape));
      if (!anyMovePossible) {
        setGameOver(true);
      }
    }
    // If all shapes are null or empty, don't trigger game over here (let shape refresh logic handle it)
  }, [isLineCleared, isRefreshingShapes, gameOver, shapes, grid]);

  // --- After shapes are refreshed, check for game over ---
useEffect(() => {
  if (!isRefreshingShapes && !isLineCleared && !gameOver) {
    checkGameOver();
  }
}, [isRefreshingShapes, isLineCleared, gameOver, shapes, grid, checkGameOver]);

// --- After line clear animation completes, check for game over ---
useEffect(() => {
  if (!isLineCleared && !isRefreshingShapes && !gameOver) {
    checkGameOver();
  }
}, [isLineCleared, isRefreshingShapes, gameOver, shapes, grid, checkGameOver]);

// --- After undo, check for game over ---
useEffect(() => {
  if (!gameOver) {
    checkGameOver();
  }
}, [prevGameState, gameOver, checkGameOver]);

  // In App.js, when opening/closing settings:
  useEffect(() => {
    const backdrop = document.querySelector('.settings-backdrop');
    const menu = document.querySelector('.settings-menu');
    if (menuOpen) {
      backdrop?.classList.add('visible');
      menu?.classList.add('visible');
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      backdrop?.classList.remove('visible');
      menu?.classList.remove('visible');
      document.body.style.overflow = '';
    }
  }, [menuOpen, isMobile]);

  // Effect for Game Over modal visibility
  useEffect(() => {
    const gameOverOverlay = document.querySelector('.game-over-overlay');
    const gameOverModal = document.querySelector('.game-over-modal');
    if (gameOver) {
      gameOverOverlay?.classList.add('visible');
      gameOverModal?.classList.add('visible');
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      gameOverOverlay?.classList.remove('visible');
      gameOverModal?.classList.remove('visible');
      // Only reset body overflow if no other modal is active
      if (!menuOpen && !isTutorialOpen) {
        document.body.style.overflow = '';
      }
    }
  }, [gameOver, isMobile, menuOpen, isTutorialOpen]);

  // Effect for Tutorial modal visibility
  useEffect(() => {
    const tutorialBackdrop = document.querySelector('.tutorial-backdrop');
    const tutorialModal = document.querySelector('.tutorial-modal');
    if (isTutorialOpen) {
      tutorialBackdrop?.classList.add('visible');
      tutorialModal?.classList.add('visible');
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      tutorialBackdrop?.classList.remove('visible');
      tutorialModal?.classList.remove('visible');
      // Only reset body overflow if no other modal is active
      if (!menuOpen && !gameOver) {
        document.body.style.overflow = '';
      }
    }
  }, [isTutorialOpen, isMobile, menuOpen, gameOver]);

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''} ${isLandscape ? 'landscape' : 'portrait'} ${theme}`}>      <header className="app-header">
        <div className="header-left">
          <div className={`loader-logo ${isLineCleared ? 'animate-line-clear' : ''}`}></div>
          <h1>Tenfinity</h1>
        </div>
        <div className="header-right">
          {!isMobile && (
            <div className="header-score">
              <ScoreBoard score={score} highScore={highScore} />
            </div>
          )}
          <button
            className="gear-icon"
            onClick={handleMenuOpen}
            aria-label="Open settings menu"
          >
            ⚙️
          </button>
        </div>
      </header>
      
      {isTutorialOpen && (
        <>
          {/* Ensure backdrop and modal have the new .visible class system */}
          <div className="tutorial-backdrop"></div> 
          <div className="tutorial-modal">
            <button 
              className="tutorial-close-btn" 
              onClick={() => {
                setIsTutorialOpen(false);
                localStorage.setItem('tutorialSeen', 'true');
              }}
              aria-label="Close tutorial"
            >
              ✕
            </button>
            <h2>How to Play</h2>
            <p>Drag and drop shapes onto the grid to create complete lines.</p>
            <p>Clear lines horizontally or vertically to score points!</p>
            <h4>Difficulty Levels:</h4>
            <ul>
              <li><strong>Easy:</strong> Simpler shapes like squares and small lines</li>
              <li><strong>Normal:</strong> Classic shapes including T, Z and L shapes</li>
              <li><strong>Hard:</strong> Complex shapes with more blocks and unusual patterns</li>
              <li><strong>Extreme:</strong> All shapes from all difficulty levels mixed together!</li>
            </ul>
            <p>Keyboard shortcuts:</p>
            <ul>
              <li>R - Restart game</li>
              <li>H - Show this help</li>
            </ul>
            <button onClick={() => {
              setIsTutorialOpen(false);
              localStorage.setItem('tutorialSeen', 'true');
            }}>Got it!</button>
          </div>
        </>
      )}

      <SettingsMenu
        isOpen={menuOpen}
        onClose={handleMenuClose}
        isMobile={isMobile}
        onRestart={restartGame}
        difficulty={difficulty}
        onChangeDifficulty={changeDifficulty}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        theme={theme}
        onChangeTheme={changeTheme}
        onSaveGame={saveGame}
        onLoadGame={loadGame}
        onOpenTutorial={useCallback(() => setIsTutorialOpen(true), [])} // Memoize tutorial opener
      />
        <div className="game-container">
        {isMobile && (
          <div className="mobile-score-display">
            <ScoreBoard score={score} highScore={highScore} />
          </div>
        )}
        {/* Assign ref to the grid board container */}
        <div className="grid-board-container" ref={gridRef}> 
          <GridBoard 
            grid={grid} 
            onDrop={handleDrop} 
            onDragOver={handleDragOver} 
            onDragLeave={handleDragLeave}
            previewShape={draggingShape && draggingShape.shape}
            previewPos={previewPos}
            isMobile={isMobile}
            onCellClick={handleCellClick} 
            onMouseMove={handleGridMouseMove}
            selectedShape={!!selectedShape} 
            cellColors={colorGrid}
          />
        </div>
        <div className="shapes-container">
          <NextShapes 
            shapes={shapes} 
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
            isMobile={isMobile}
            onShapeClick={handleShapeClick}
            selectedShapeIndex={selectedShape?.index}
          />
          <button
            className="undo-btn"
            onClick={handleUndo}
            disabled={!prevGameState}
            aria-label="Undo last move"
          >
            ↺ Undo
          </button>
        </div>
        
        {isMobile && draggingShape && dragPosition && (
          <div className="floating-drag-shape" style={{
            position: 'fixed',
            left: dragPosition.x,
            top: dragPosition.y - TOUCH_Y_OFFSET,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 1000
          }}>
            <Shape shape={draggingShape.shape} />
          </div>
        )}
      </div>
      {gameOver && (
        <GameOver 
          onRestart={restartGame} 
          finalScore={score} 
          highScore={highScore}
        />
      )}
      <footer className='footer'>
        <p>
          Created by{" "}
          <a href="https://walterhouse.co.za" target="_blank" rel="noreferrer">Ashtin Walter</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
