import React from "react";
import GridCell from "./GridCell";
import PropTypes from "prop-types";

const GridBoard = ({ grid, onDrop }) => {
  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default to allow drop
    console.log("Drag over a cell");
  };

  const handleDrop = (e, rowIndex, cellIndex) => {
    e.preventDefault();
    const shapeData = e.dataTransfer.getData("shape");
    const shape = shapeData ? JSON.parse(shapeData) : null;
    
    console.log("Drop event fired");
    if (shape) {
      console.log("Shape dropped:", shape);
      onDrop(shape, rowIndex, cellIndex);
    } else {
      console.error("Shape data not found in dataTransfer.");
    }
  };

  return (
    <div className="grid-board">
      {grid.map((row, rowIndex) => 
        row.map((cell, cellIndex) => (
          <div
            key={`${rowIndex}-${cellIndex}`}
            className="grid-cell"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, rowIndex, cellIndex)}
          >
            <GridCell filled={cell} />
          </div>
        ))
      )}
    </div>
  );
};

GridBoard.propTypes = {
  grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
  onDrop: PropTypes.func.isRequired,
};

export default GridBoard;
