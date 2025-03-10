import React, { useState, useEffect } from 'react';
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
  const [gameOver, setGameOver] = useState(false);
  // New state for drag preview
  const [draggingShape, setDraggingShape] = useState(null);
  const [previewPos, setPreviewPos] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // new state for menu toggle

  // Updated function for placing a shape on the grid
  const placeShapeOnGrid = (shape, startX, startY) => {
    const newGrid = grid.map(row => [...row]);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = startY + y;
          const gridX = startX + x;

          if (gridY >= 0 && gridY < GRID_SIZE && gridX >= 0 && gridX < GRID_SIZE && !newGrid[gridY][gridX]) {
            newGrid[gridY][gridX] = true;
          } else {
            console.warn(`Shape part out of bounds or cell already filled at [${gridY}, ${gridX}]`);
            return;
          }
        }
      }
    }

    // Instead of setting grid here, pass the grid to checkForCompletedLines to update grid and score
    checkForCompletedLines(newGrid, setScore, setGrid);
  };

  // Updated handleDrop to check for e.preventDefault before calling it
  const handleDrop = (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (!previewPos) return;
    const { row: rowIndex, col: cellIndex } = previewPos;
    if (!draggingShape) return;
    placeShapeOnGrid(draggingShape.shape, cellIndex, rowIndex);
    const newShapes = shapes.map((s, i) => i === draggingShape.index ? null : s);
    if (newShapes.every(s => s === null)) {
      setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
    } else {
      setShapes(newShapes);
    }
    setDraggingShape(null);
    setPreviewPos(null);
  };

  // Update the handleDragOver function:
  const handleDragOver = (e) => {
    e.preventDefault();
    // Use currentTarget to get the grid cell's data attributes
    const row = Number(e.currentTarget.getAttribute('data-row'));
    const col = Number(e.currentTarget.getAttribute('data-col'));
    if (!isNaN(row) && !isNaN(col)) {
      setPreviewPos({ row, col });
    }
  };

  // Optional: clear preview when leaving a cell
  const handleDragLeave = (e) => {
    setPreviewPos(null);
  };

  // Updated to accept shape index as well
  const handleDragStart = (e, index, shape) => {
    setDraggingShape({ index, shape });
    e.dataTransfer.setData('shape', JSON.stringify(shape));
  };

  useEffect(() => {
    if (!shapes.some(shape => shape && canPlaceShape(grid, shape))) {
      setGameOver(true);
    }
  }, [grid, shapes]);

  const restartGame = () => {
    setGrid(generateEmptyGrid());
    setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
    setScore(0);
    setGameOver(false);
    setMenuOpen(false);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="loader-logo"></div> 
        <h1>Tenfinity</h1>
      </header>
      {/* New settings icon and menu */}
      <div className="settings-container">
        <div className="gear-icon" onClick={() => setMenuOpen(!menuOpen)}>⚙️</div>
        {menuOpen && (
          <div className="settings-menu">
            <button className="menu-btn" onClick={restartGame}>Restart Game</button>
            <button className="menu-btn">Placeholder 1</button>
            <button className="menu-btn">Placeholder 2</button>
          </div>
        )}
      </div>
      <ScoreBoard score={score} />
      <div className="game-container">
        <GridBoard 
          grid={grid} 
          onDrop={handleDrop} 
          onDragOver={handleDragOver} 
          onDragLeave={handleDragLeave}
          // New props for preview
          previewShape={draggingShape && draggingShape.shape}
          previewPos={previewPos}
        />
        <NextShapes shapes={shapes} onDragStart={handleDragStart} />
        {/* Removed restart-btn from here */}
      </div>
      <footer className='footer'>
        <p>
          Created by{' '}
          <a href="https://ajwdev.netlify.app/" target="_blank" rel="noreferrer">Ashtin Walter</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
