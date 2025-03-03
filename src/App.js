import React, { useState, useEffect } from 'react';
import GridBoard from './components/GridBoard';
import NextShapes from './components/NextShapes';
import GameOver from './components/GameOver';
import ScoreBoard from './components/ScoreBoard';
import { getRandomShape } from './utils/shapeGenerator';
import './App.css';

// Utility function to generate an empty grid
const generateEmptyGrid = () => Array(10).fill().map(() => Array(10).fill(false));

// Utility function to check for completed lines
const checkForCompletedLines = (grid, setScore) => {
  let linesCleared = 0;

  // Check for completed rows
  grid.forEach(row => {
    if (row.every(cell => cell)) {
      linesCleared++;
    }
  });

  // Check for completed columns
  for (let col = 0; col < 10; col++) {
    let columnComplete = true;
    for (let row = 0; row < 10; row++) {
      if (!grid[row][col]) {
        columnComplete = false;
        break;
      }
    }
    if (columnComplete) {
      linesCleared++;
    }
  }

  // Update the score if any lines were cleared
  if (linesCleared > 0) {
    setScore(prevScore => prevScore + linesCleared);
  }
};

const App = () => {
  const [grid, setGrid] = useState(generateEmptyGrid());
  const [shapes, setShapes] = useState([getRandomShape(), getRandomShape(), getRandomShape()]);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Logic for placing a shape on the grid
  const placeShapeOnGrid = (shape, startX, startY) => {
    const newGrid = grid.map(row => [...row]);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = startY + y;
          const gridX = startX + x;

          if (gridY >= 0 && gridY < 10 && gridX >= 0 && gridX < 10 && !newGrid[gridY][gridX]) {
            newGrid[gridY][gridX] = true;
          } else {
            console.warn(`Shape part out of bounds or cell already filled at [${gridY}, ${gridX}]`);
            return;
          }
        }
      }
    }

    setGrid(newGrid);
    console.log("Updated Grid:", newGrid);

    setCurrentShapeIndex(prevIndex => (prevIndex + 1) % 3);

    if (currentShapeIndex === 2) {
      setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
    }

    checkForCompletedLines(newGrid, setScore);
  };

  const handleDrop = (shape, rowIndex, cellIndex) => {
    placeShapeOnGrid(shape, cellIndex, rowIndex);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragStart = (e, shape) => {
    e.dataTransfer.setData('shape', JSON.stringify(shape));
  };

  useEffect(() => {
    if (!shapes.some(shape => canPlaceShape(grid, shape))) {
      setGameOver(true);
    }
  }, [grid, shapes]);

  const canPlaceShape = (grid, shape) => {
    for (let rowIndex = 0; rowIndex <= 10 - shape.length; rowIndex++) {
      for (let colIndex = 0; colIndex <= 10 - shape[0].length; colIndex++) {
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

  const restartGame = () => {
    setGrid(generateEmptyGrid());
    setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
    setCurrentShapeIndex(0);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="App">
      <h1>Tenfinity</h1>
      <ScoreBoard score={score} />
      <GridBoard 
        grid={grid} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
      />
      <NextShapes shapes={shapes} currentShapeIndex={currentShapeIndex} onDragStart={handleDragStart} />
      <button onClick={restartGame}>Restart Game</button>
      {gameOver && <GameOver onRestart={restartGame} />}
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
