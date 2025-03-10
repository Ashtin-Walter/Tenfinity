import React, { useCallback } from "react";
import GridCell from "./GridCell";
import PropTypes from "prop-types";

const GridBoard = ({ grid, onDrop, onDragOver, onDragLeave, previewShape, previewPos }) => {
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    onDragOver(e); // delegate to parent's handler to update preview position
  }, [onDragOver]);

  const handleDrop = useCallback((e, rowIndex, cellIndex) => {
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
  }, [onDrop]);

  return (
    <div className="grid-board">
      {grid.map((row, rowIndex) => 
        row.map((cell, cellIndex) => {
          let showPreview = false;
          if (previewShape && previewPos) {
            const shapeRow = rowIndex - previewPos.row;
            const shapeCol = cellIndex - previewPos.col;
            if (
              shapeRow >= 0 &&
              shapeRow < previewShape.length &&
              shapeCol >= 0 &&
              shapeCol < previewShape[0].length &&
              previewShape[shapeRow][shapeCol]
            ) {
              showPreview = true;
            }
          }
          return (
            <div
              key={`${rowIndex}-${cellIndex}`}
              data-row={rowIndex}
              data-col={cellIndex}
              className={`grid-cell ${cell ? 'filled' : ''} ${showPreview ? 'preview' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={onDragLeave}
              onDrop={(e) => handleDrop(e, rowIndex, cellIndex)}
            >
              <GridCell filled={cell} preview={showPreview} />
            </div>
          );
        })
      )}
    </div>
  );
};

GridBoard.propTypes = {
  grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
  onDrop: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  previewShape: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
  previewPos: PropTypes.shape({
    row: PropTypes.number,
    col: PropTypes.number
  })
};

export default GridBoard;
