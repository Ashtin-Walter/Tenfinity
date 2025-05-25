import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import GridBoard from './components/GridBoard';
import NextShapes from './components/NextShapes';
import GameOver from './components/GameOver';
import ScoreBoard from './components/ScoreBoard';
import SettingsMenu from './components/SettingsMenu';
import { getBalancedShapes } from './utils/shapeGenerator';
import './App.css';
import Shape from './components/Shape';

const GRID_SIZE = 10; // added constant GRID_SIZE

// Utility function to generate an empty grid
const generateEmptyGrid = () => Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));

// Utility function to generate an empty color grid
const generateEmptyColorGrid = () => Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));

// Modified utility function to always update grid state and trigger animation when lines are cleared
const checkForCompletedLines = (grid, colorGrid, setScore, setGrid, setColorGrid, setIsLineCleared) => {
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

  // Clear completed rows and columns
  const newGrid = grid.map(row => [...row]);
  const newColorGrid = colorGrid.map(row => [...row]);

  // Mark cells for animation before clearing
  for (const rowIndex of completedRows) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cellElement = document.querySelector(`.grid-cell-container[data-row="${rowIndex}"][data-col="${col}"] .grid-cell`);
      if (cellElement) {
        cellElement.classList.add('cell-cleared');
      }
    }
  }

  for (const colIndex of completedCols) {
    for (let row = 0; row < GRID_SIZE; row++) {
      const cellElement = document.querySelector(`.grid-cell-container[data-row="${row}"][data-col="${colIndex}"] .grid-cell`);
      if (cellElement) {
        cellElement.classList.add('cell-cleared');
      }
    }
  }

  // Delayed clearing of completed lines to allow for animation
  setTimeout(() => {
    // Clear completed rows
    for (const rowIndex of completedRows) {
      newGrid[rowIndex] = Array(GRID_SIZE).fill(false);
      newColorGrid[rowIndex] = Array(GRID_SIZE).fill(null);
    }

    // Clear completed columns
    for (const colIndex of completedCols) {
      for (let row = 0; row < GRID_SIZE; row++) {
        newGrid[row][colIndex] = false;
        newColorGrid[row][colIndex] = null;
      }
    }

    // Update the grid state
    setGrid([...newGrid]);
    setColorGrid([...newColorGrid]);
  }, 500); // Timing matches the animation duration

  // Always update grid state, even if no lines were cleared
  setGrid([...grid]);
  setColorGrid([...colorGrid]);

  if (linesCleared > 0) {
    setScore(prevScore => prevScore + linesCleared);
    // Trigger the animation when lines are cleared
    setIsLineCleared(true);
    // Reset the animation state after the animation duration
    setTimeout(() => {
      setIsLineCleared(false);
    }, 1500); // Duration matches our new animation
  }
};

// Moved canPlaceShape before useEffect for correct usage
const canPlaceShape = (grid, shape) => {
  const pattern = shape.pattern || shape;
  for (let rowIndex = 0; rowIndex <= GRID_SIZE - pattern.length; rowIndex++) {
    for (let colIndex = 0; colIndex <= GRID_SIZE - pattern[0].length; colIndex++) {
      let canPlace = true;
      for (let y = 0; y < pattern.length; y++) {
        for (let x = 0; x < pattern[y].length; x++) {
          if (pattern[y][x] && grid[rowIndex + y][colIndex + x]) {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) break;
      }
      if (canPlace) {
        return true;
      }
    }
  }
  return false;
};

const App = () => {
  const [grid, setGrid] = useState(generateEmptyGrid());
  const [colorGrid, setColorGrid] = useState(generateEmptyColorGrid());
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
  const [isTutorialOpen, setIsTutorialOpen] = useState(!localStorage.getItem('tutorialSeen'));
  const [isLineCleared, setIsLineCleared] = useState(false); // new state to track line clearing

  // Add a touchTimeout ref to throttle touch events
  const touchTimeoutRef = useRef(null);
  const lastTouchPosRef = useRef(null);
  const touchStartTimeRef = useRef(0);

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
    return getBalancedShapes(3, difficulty, shapes);
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

  const placeShapeOnGrid = useCallback((shape, startX, startY) => {
    const newGrid = grid.map(row => [...row]);
    const newColorGrid = colorGrid.map(row => [...row]);
    // Keep track of newly placed cells for animation
    const newlyPlacedCells = [];
    
    // Get the shape pattern and color
    const pattern = shape.pattern || shape;
    const color = shape.color || 'var(--accent-color)';

    for (let y = 0; y < pattern.length; y++) {
      for (let x = 0; x < pattern[y].length; x++) {
        if (pattern[y][x]) {
          const gridY = startY + y;
          const gridX = startX + x;

          if (gridY >= 0 && gridY < GRID_SIZE && gridX >= 0 && gridX < GRID_SIZE && !newGrid[gridY][gridX]) {
            newGrid[gridY][gridX] = true;
            newColorGrid[gridY][gridX] = color;
            // Store coordinates of newly placed cells
            newlyPlacedCells.push({ row: gridY, col: gridX });
          } else {
            return false;
          }
        }
      }
    }

    // First apply the grid update
    setGrid(newGrid);
    setColorGrid(newColorGrid);
    
    // Then apply the "newly-placed" class to the placed cells for animation
    setTimeout(() => {
      newlyPlacedCells.forEach(({row, col}) => {
        const cellElement = document.querySelector(`.grid-cell-container[data-row="${row}"][data-col="${col}"] .grid-cell`);
        if (cellElement) {
          cellElement.classList.add('newly-placed');
          // Remove the class after animation completes
          setTimeout(() => {
            cellElement.classList.remove('newly-placed');
          }, 800); // Slightly longer than animation duration to ensure it completes
        }
      });
    }, 10);

    // Check for completed lines after a slight delay to allow animation to be visible
    setTimeout(() => {
      checkForCompletedLines(newGrid, newColorGrid, setScore, setGrid, setColorGrid, setIsLineCleared);
    }, 400);

    return true;
  }, [grid, colorGrid]);

  const handleDrop = useCallback((e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!previewPos || !draggingShape) return;
    
    const { row: rowIndex, col: cellIndex } = previewPos;
    const success = placeShapeOnGrid(draggingShape.shape, cellIndex, rowIndex);
    
    if (success) {
      const newShapes = shapes.map((s, i) => i === draggingShape.index ? null : s);
      if (newShapes.every(s => s === null)) {
        // Generate new shapes with the current difficulty setting
        setShapes(getNextShapes());
      } else {
        setShapes(newShapes);
      }
      
      // Add visual feedback for successful placement
      const gridElement = document.querySelector('.grid-board');
      if (gridElement) {
        gridElement.classList.add('shape-placed');
        setTimeout(() => {
          gridElement.classList.remove('shape-placed');
        }, 300);
      }
    }
    
    setDraggingShape(null);
    setPreviewPos(null);
  }, [previewPos, draggingShape, shapes, placeShapeOnGrid, getNextShapes]);

  // Improved touch move handler with throttling and better positioning
  const handleTouchMove = useCallback((e) => {
    if (draggingShape) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    if (!touch) return;
    // Track last touch for drop
    lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY, timestamp: Date.now() };
    // Update preview position continuously
    const raw = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = raw?.closest('.grid-cell-container');
    if (cell && cell.dataset.row !== undefined) {
      setPreviewPos({ row: Number(cell.dataset.row), col: Number(cell.dataset.col) });
    } else {
      setPreviewPos(null);
    }
    // Update floating drag overlay
    if (draggingShape) setDragPosition({ x: touch.clientX, y: touch.clientY });
  }, [draggingShape]);

  // Enhanced touch end handler with better reliability
  const handleTouchEnd = useCallback((e) => {
    // Calculate touch duration to distinguish between taps and drags
    const touchDuration = Date.now() - touchStartTimeRef.current;
    const wasShortTouch = touchDuration < 300; // Short touches are likely taps
    
    // Clear any pending throttle timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Handle drop based on where the user lifted their finger
    if (lastTouchPosRef.current) {
      const raw = document.elementFromPoint(
        lastTouchPosRef.current.x,
        lastTouchPosRef.current.y
      );
      const cell = raw?.closest('.grid-cell-container');
      if (cell && cell.dataset.row !== undefined) {
        setPreviewPos({ row: Number(cell.dataset.row), col: Number(cell.dataset.col) });
      } else {
        setPreviewPos(null);
      }
    }
    
    handleDrop();
    
    // Only reset draggingShape and preview if this wasn't a short touch/tap
    // This helps for click-to-place where we want to keep the selection
    if (!wasShortTouch || !selectedShape) {
      setDraggingShape(null);
      setPreviewPos(null);
    }
    
    lastTouchPosRef.current = null;
    
    // Remove the touching class
    document.body.classList.remove('touching');

    // clear drag overlay
    setDragPosition(null);
  }, [handleDrop, selectedShape]);

  // Improved touch start handler with better tracking
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

  // Handle clicking on a shape to select it
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

  // Handle clicking on a grid cell when a shape is selected
  const handleCellClick = useCallback((rowIndex, colIndex) => {
    if (!selectedShape) return;
    
    const success = placeShapeOnGrid(selectedShape.shape, colIndex, rowIndex);
    
    if (success) {
      const newShapes = shapes.map((s, i) => i === selectedShape.index ? null : s);
      if (newShapes.every(s => s === null)) {
        // Generate new shapes with the current difficulty setting
        setShapes(getNextShapes());
      } else {
        setShapes(newShapes);
      }
      
      // Add visual feedback for successful placement
      const gridElement = document.querySelector('.grid-board');
      if (gridElement) {
        gridElement.classList.add('shape-placed');
        setTimeout(() => {
          gridElement.classList.remove('shape-placed');
        }, 300);
      }
      
      // Reset selectedShape and preview
      setSelectedShape(null);
      setDraggingShape(null);
      setPreviewPos(null);
    }
  }, [selectedShape, placeShapeOnGrid, shapes, getNextShapes]);

  // Update preview position when mouse moves over grid
  const handleGridMouseMove = useCallback((e) => {
    if (!selectedShape) return;
    
    const element = e.target.closest('.grid-cell-container');
    if (element && element.dataset.row !== undefined && element.dataset.col !== undefined) {
      setPreviewPos({
        row: Number(element.dataset.row),
        col: Number(element.dataset.col)
      });
    }
  }, [selectedShape]);

  // Clear the selected shape if the user clicks outside the grid and shapes area
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // If no shape is selected, do nothing
      if (!selectedShape) return;
      
      // Check if the click is inside grid or shapes container
      const isGridClick = e.target.closest('.grid-board');
      const isShapeClick = e.target.closest('.shape-preview');
      
      // If clicked outside both, deselect the shape
      if (!isGridClick && !isShapeClick) {
        setSelectedShape(null);
        setDraggingShape(null);
        setPreviewPos(null);
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [selectedShape]);

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

  useEffect(() => {
    if (isMobile) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      // Add touchcancel handling for better reliability
      document.addEventListener('touchcancel', handleTouchEnd);
    }
    
    return () => {
      if (isMobile) {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
        
        // Also clean up any lingering timeouts
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
        }
      }
    };
  }, [isMobile, handleTouchMove, handleTouchEnd]);

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

  // Cleanup the touching class when touch ends
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

  // Removed duplicate handleTouchStart declaration

  const handleDragOver = (e) => {
    e.preventDefault();
    const row = Number(e.currentTarget.getAttribute('data-row'));
    const col = Number(e.currentTarget.getAttribute('data-col'));
    if (!isNaN(row) && !isNaN(col)) {
      setPreviewPos({ row, col });
    }
  };

  const handleDragLeave = (e) => {
    setPreviewPos(null);
  };

  const handleDragStart = (e, index, shape) => {
    setDraggingShape({ index, shape });
    
    // For compatibility with native HTML5 drag and drop
    // We need to stringify the shape including its color
    e.dataTransfer.setData('shape', JSON.stringify(shape));
  };

  // Check if any shape can be placed
  const canPlaceAnyShape = useMemo(() => {
    return shapes.some(shape => shape && canPlaceShape(grid, shape));
  }, [grid, shapes]);

  // Set game over state when no more moves are possible
  useEffect(() => {
    if (!canPlaceAnyShape && !gameOver) {
      setGameOver(true);
    }
  }, [canPlaceAnyShape, gameOver]);

  // Update high score only when game is over to preserve previous highScore during game
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score);
    }
  }, [gameOver, score, highScore]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.body.classList.toggle('theme-modern', theme === 'modern');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const saveGame = () => {
    const gameState = {
      grid,
      colorGrid,
      shapes,
      score,
      difficulty
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  };

  const loadGame = () => {
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
  };

  const handleMenuOpen = () => {
    setMenuOpen(true);
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''} ${isLandscape ? 'landscape' : 'portrait'} ${theme}`}>
      <header className="app-header">
        <h1>Tenfinity</h1>
        <div className={`loader-logo ${isLineCleared ? 'animate-line-clear' : ''}`}></div>
        {!isMobile && (
          <div className="header-score">
            <ScoreBoard score={score} highScore={highScore} />
          </div>
        )}
        {/* Settings gear in header */}
        <button
          className="gear-icon"
          onClick={handleMenuOpen}
          aria-label="Open settings menu"
        >
          ⚙️
        </button>
      </header>
      
      {isTutorialOpen && (
        <>
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

      {/* Settings menu overlay */}
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
        onOpenTutorial={() => setIsTutorialOpen(true)}
      />
      
      <div className="game-container">
        {isMobile && (
          <div className="mobile-score-display">
            <ScoreBoard score={score} highScore={highScore} />
          </div>
        )}
        <div className="shapes-container">
          <NextShapes 
            shapes={shapes} 
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
            isMobile={isMobile}
            onShapeClick={handleShapeClick} // Pass the click handler
            selectedShapeIndex={selectedShape?.index} // Pass the selected shape index
          />
        </div>
        <div className="grid-board-container">
          <GridBoard 
            grid={grid} 
            onDrop={handleDrop} 
            onDragOver={handleDragOver} 
            onDragLeave={handleDragLeave}
            previewShape={draggingShape && draggingShape.shape}
            previewPos={previewPos}
            isMobile={isMobile}
            onCellClick={handleCellClick} // Pass the cell click handler
            onMouseMove={handleGridMouseMove} // Pass the mouse move handler
            selectedShape={!!selectedShape} // Boolean flag indicating if a shape is selected
            cellColors={colorGrid} // Pass cell colors for the grid
          />
        </div>
        {/* Floating preview shape during touch drag */}
        {isMobile && draggingShape && dragPosition && (
          <div className="floating-drag-shape" style={{ position: 'fixed', left: dragPosition.x, top: dragPosition.y, transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 1000 }}>
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
          Created by{' '}
          <a href="https://walterhouse.co.za" target="_blank" rel="noreferrer">Ashtin Walter</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
