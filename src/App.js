import React, { useState, useEffect, useCallback } from 'react';
import GridBoard from './components/GridBoard';
import NextShapes from './components/NextShapes';
import GameOver from './components/GameOver';
import ScoreBoard from './components/ScoreBoard';
import { getRandomShape } from './utils/shapeGenerator';
import './App.css';

const GRID_SIZE = 10; // added constant GRID_SIZE

// Utility function to generate an empty grid
const generateEmptyGrid = () => Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));

// Modified utility function to always update grid state
const checkForCompletedLines = (grid, setScore, setGrid) => {
  let linesCleared = 0;

  // Clear completed rows
  grid.forEach((row, i) => {
    if (row.every(cell => cell)) {
      grid[i] = Array(GRID_SIZE).fill(false);
      linesCleared++;
    }
  });

  // Clear completed columns
  for (let col = 0; col < GRID_SIZE; col++) {
    let isComplete = true;
    for (let row = 0; row < GRID_SIZE; row++) {
      if (!grid[row][col]) {
        isComplete = false;
        break;
      }
    }
    if (isComplete) {
      for (let row = 0; row < GRID_SIZE; row++) {
        grid[row][col] = false;
      }
      linesCleared++;
    }
  }

  // Always update grid state, even if no lines were cleared
  setGrid([...grid]);

  if (linesCleared > 0) {
    setScore(prevScore => prevScore + linesCleared);
  }
};

// Moved canPlaceShape before useEffect for correct usage
const canPlaceShape = (grid, shape) => {
  for (let rowIndex = 0; rowIndex <= GRID_SIZE - shape.length; rowIndex++) {
    for (let colIndex = 0; colIndex <= GRID_SIZE - shape[0].length; colIndex++) {
      let canPlace = true;
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] && grid[rowIndex + y][colIndex + x]) {
            canPlace = false;
            break;
          }
        }
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
  const [shapes, setShapes] = useState([getRandomShape(), getRandomShape(), getRandomShape()]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(localStorage.getItem('highScore') || 0);
  const [difficulty, setDifficulty] = useState('normal');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'default'); // new state for theme
  const [draggingShape, setDraggingShape] = useState(null);
  const [previewPos, setPreviewPos] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // new state for menu toggle
  const [gameOver, setGameOver] = useState(false); // new state for game over
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const [isTutorialOpen, setIsTutorialOpen] = useState(!localStorage.getItem('tutorialSeen'));

  const changeDifficulty = useCallback((newDifficulty) => {
    setDifficulty(newDifficulty);
    // Restart game when difficulty changes
    setGrid(generateEmptyGrid());
    setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
    setScore(0);
    setGameOver(false);
  }, []);

  const restartGame = useCallback(() => {
    setGrid(generateEmptyGrid());
    // Use getRandomShape directly instead of getNextShape
    setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
    setScore(0);
    setGameOver(false);
    setMenuOpen(false);
  }, []);


  const placeShapeOnGrid = useCallback((shape, startX, startY) => {
    const newGrid = grid.map(row => [...row]);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = startY + y;
          const gridX = startX + x;

          if (gridY >= 0 && gridY < GRID_SIZE && gridX >= 0 && gridX < GRID_SIZE && !newGrid[gridY][gridX]) {
            newGrid[gridY][gridX] = true;
          } else {
            return false;
          }
        }
      }
    }

    checkForCompletedLines(newGrid, setScore, setGrid);
    return true;
  }, [grid]);

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
        setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
      } else {
        setShapes(newShapes);
      }
    }
    
    setDraggingShape(null);
    setPreviewPos(null);
  }, [previewPos, draggingShape, shapes, placeShapeOnGrid]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element?.dataset?.row !== undefined && element?.dataset?.col !== undefined) {
      setPreviewPos({
        row: Number(element.dataset.row),
        col: Number(element.dataset.col)
      });
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    handleDrop();
    setDraggingShape(null);
    setPreviewPos(null);
  }, [handleDrop]);

 

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
    }
    
    return () => {
      if (isMobile) {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
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

  const handleTouchStart = (e, index, shape) => {
    e.preventDefault();
    setDraggingShape({ index, shape });
  };

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
    e.dataTransfer.setData('shape', JSON.stringify(shape));
  };

  useEffect(() => {
    if (!shapes.some(shape => shape && canPlaceShape(grid, shape))) {
      setGameOver(true);
    }
  }, [grid, shapes]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score);
    }
  }, [score, highScore]);

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
      shapes,
      score,
      difficulty
    };
    localStorage.setItem('gameState', JSON.stringify(gameState));
  };

  const loadGame = () => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const { grid, shapes, score, difficulty } = JSON.parse(savedState);
      setGrid(grid);
      setShapes(shapes);
      setScore(score);
      setDifficulty(difficulty);
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
        <div className="loader-logo"></div>
        <div className="header-score">
          <ScoreBoard score={score} highScore={highScore} />
        </div>
      </header>
      
      {isTutorialOpen && (
        <div className="tutorial-modal">
          <h2>How to Play</h2>
          <p>Drag and drop shapes onto the grid to create complete lines.</p>
          <p>Clear lines horizontally or vertically to score points!</p>
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
      )}

      <div className={`settings-container ${menuOpen ? 'menu-open' : ''}`}>
        <div className="gear-icon" onClick={handleMenuOpen}>⚙️</div>
        {menuOpen && (
          <>
            <div className="settings-backdrop" onClick={handleMenuClose}></div>
            <div className="settings-menu">
              <button className="menu-btn" onClick={restartGame}>Restart Game</button>
              <div className="difficulty-buttons">
                <button className={`menu-btn ${difficulty === 'easy' ? 'active' : ''}`} 
                        onClick={() => changeDifficulty('easy')}>Easy</button>
                <button className={`menu-btn ${difficulty === 'normal' ? 'active' : ''}`} 
                        onClick={() => changeDifficulty('normal')}>Normal</button>
                <button className={`menu-btn ${difficulty === 'hard' ? 'active' : ''}`} 
                        onClick={() => changeDifficulty('hard')}>Hard</button>
              </div>
              <button className="menu-btn" onClick={toggleDarkMode}>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <div className="theme-buttons">
                <button className={`menu-btn ${theme === 'default' ? 'active' : ''}`} 
                        onClick={() => changeTheme('default')}>Default</button>
                <button className={`menu-btn ${theme === 'modern' ? 'active' : ''}`} 
                        onClick={() => changeTheme('modern')}>Modern</button>
              </div>
              <button className="menu-btn" onClick={saveGame}>Save Game</button>
              <button className="menu-btn" onClick={loadGame}>Load Game</button>
              <button className="menu-btn" onClick={() => setIsTutorialOpen(true)}>Help</button>
              <button className="menu-btn close-btn" onClick={handleMenuClose}>✕</button>
            </div>
          </>
        )}
      </div>
      <div className="game-container">
        <div className="shapes-container">
          <NextShapes 
            shapes={shapes} 
            onDragStart={handleDragStart}
            onTouchStart={handleTouchStart}
            isMobile={isMobile}
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            isMobile={isMobile}
          />
        </div>
      </div>
      {gameOver && <GameOver restartGame={restartGame} />}
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
