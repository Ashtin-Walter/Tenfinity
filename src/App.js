import React, { useState, useEffect } from 'react';
import GridBoard from './components/GridBoard';
import NextShapes from './components/NextShapes';
import GameOver from './components/GameOver';
import ScoreBoard from './components/ScoreBoard';
import { getRandomShape } from './utils/shapeGenerator';
import './App.css';

const generateEmptyGrid = () => Array(10).fill().map(() => Array(10).fill(false));

const App = () => {
  const [grid, setGrid] = useState(generateEmptyGrid());
  const [shapes, setShapes] = useState([getRandomShape(), getRandomShape(), getRandomShape()]);
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Logic for placing a shape on the grid
  const placeShapeOnGrid = (shape, startX, startY) => {
    // Make a deep copy of the grid to prevent direct mutation
    const newGrid = grid.map(row => [...row]);
  
    // Check the bounds before placing the shape
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = startY + y;
          const gridX = startX + x;
  
          // Ensure we're within grid bounds
          if (gridY >= 0 && gridY < 10 && gridX >= 0 && gridX < 10) {
            newGrid[gridY][gridX] = true;
          } else {
            console.warn(`Shape part out of bounds at [${gridY}, ${gridX}]`);
          }
        }
      }
    }
  
    // Update the grid state
    setGrid(newGrid);
    console.log("Updated Grid:", newGrid);
  
    // Move to the next shape
    setCurrentShapeIndex((prevIndex) => (prevIndex + 1) % 3);
    
    // When the shape queue is depleted, generate new shapes
    if (currentShapeIndex === 2) {
      setShapes([getRandomShape(), getRandomShape(), getRandomShape()]);
    }
  
    // Check for completed lines after placing the shape
    checkForCompletedLines(newGrid);
  };

  // Logic for checking completed lines
  const checkForCompletedLines = (grid) => {
    let linesCleared = 0;
    grid.forEach(row => {
      if (row.every(cell => cell)) {
        linesCleared++;
      }
    });
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
    if (linesCleared > 0) {
      setScore(score + linesCleared);
    }
  };

  const handleDrop = (shape, rowIndex, cellIndex) => {
    console.log("Dropped Shape:", shape);
    console.log("Drop Location:", rowIndex, cellIndex);
    const startX = cellIndex;
    const startY = rowIndex;
  
    // Check if shape is defined before proceeding
    if (shape && shape.length > 0) {
      placeShapeOnGrid(shape, startX, startY);
    } else {
      console.error("Shape is undefined or empty.");
    }
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
        onDrop={(shape, rowIndex, cellIndex) => handleDrop(shape, rowIndex, cellIndex)} 
      />
      <NextShapes shapes={shapes} currentShapeIndex={currentShapeIndex} />
      <button onClick={restartGame}>Restart Game</button>
      {gameOver && <GameOver onRestart={restartGame} />}
      
    </div>
  );
};

export default App;
