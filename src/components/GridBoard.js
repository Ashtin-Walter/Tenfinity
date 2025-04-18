import React, { useCallback, useMemo } from "react";
import GridCell from "./GridCell";
import PropTypes from "prop-types";

const GridBoard = ({ 
  grid, 
  onDrop, 
  onDragOver, 
  onDragLeave, 
  previewShape, 
  previewPos,
  isMobile,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onCellClick,
  onMouseMove,
  selectedShape,
  cellColors
}) => {
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    onDragOver(e); // delegate to parent's handler to update preview position
  }, [onDragOver]);

  const handleDrop = useCallback((e, rowIndex, cellIndex) => {
    e.preventDefault();
    const shapeData = e.dataTransfer.getData("shape");
    const shape = shapeData ? JSON.parse(shapeData) : null;
    
    if (shape) {
      onDrop(shape, rowIndex, cellIndex);
    }
  }, [onDrop]);

  const handleCellClick = useCallback((rowIndex, cellIndex) => {
    if (onCellClick) {
      onCellClick(rowIndex, cellIndex);
    }
  }, [onCellClick]);

  const handleMouseMove = useCallback((e) => {
    if (onMouseMove) {
      onMouseMove(e);
    }
  }, [onMouseMove]);

  // Get shape color for preview
  const previewColor = useMemo(() => {
    return previewShape && previewShape.color ? previewShape.color : 'var(--accent-color)';
  }, [previewShape]);

  // Extract the pattern from shape object if needed
  const shapePattern = useMemo(() => {
    return previewShape ? (previewShape.pattern || previewShape) : null;
  }, [previewShape]);

  // Use useMemo to optimize the grid rendering
  const renderedGrid = useMemo(() => {
    return grid.map((row, rowIndex) => 
      row.map((cell, cellIndex) => {
        let showPreview = false;
        let cellColor = cell && cellColors ? cellColors[rowIndex][cellIndex] : null;
        
        if (shapePattern && previewPos) {
          const shapeRow = rowIndex - previewPos.row;
          const shapeCol = cellIndex - previewPos.col;
          if (
            shapeRow >= 0 &&
            shapeRow < shapePattern.length &&
            shapeCol >= 0 &&
            shapeCol < shapePattern[0].length &&
            shapePattern[shapeRow][shapeCol]
          ) {
            showPreview = true;
          }
        }
        
        // Create a proper ARIA label for accessibility
        const ariaLabel = `Grid cell at row ${rowIndex + 1}, column ${cellIndex + 1}${cell ? ', filled' : ''}${showPreview ? ', preview' : ''}`;
        
        return (
          <div
            key={`${rowIndex}-${cellIndex}`}
            data-row={rowIndex}
            data-col={cellIndex}
            className={`grid-cell-container ${selectedShape ? 'cell-clickable' : ''}`}
            onDragOver={!isMobile ? handleDragOver : undefined}
            onDragLeave={!isMobile ? onDragLeave : undefined}
            onDrop={!isMobile ? (e) => handleDrop(e, rowIndex, cellIndex) : undefined}
            onTouchStart={isMobile ? onTouchStart : undefined}
            onTouchMove={isMobile ? onTouchMove : undefined}
            onTouchEnd={isMobile ? onTouchEnd : undefined}
            onClick={() => handleCellClick(rowIndex, cellIndex)}
            role="gridcell"
            aria-label={ariaLabel}
            aria-colindex={cellIndex + 1}
            aria-rowindex={rowIndex + 1}
          >
            <GridCell 
              filled={cell} 
              preview={showPreview} 
              color={showPreview ? previewColor : cellColor}
            />
          </div>
        );
      })
    );
  }, [
    grid, 
    shapePattern, 
    previewPos, 
    handleDragOver, 
    onDragLeave, 
    handleDrop, 
    isMobile, 
    onTouchStart, 
    onTouchMove, 
    onTouchEnd, 
    handleCellClick, 
    selectedShape, 
    cellColors,
    previewColor
  ]);

  return (
    <div 
      className={`grid-board ${selectedShape ? 'shape-selected' : ''}`}
      role="grid" 
      aria-label="Game grid board"
      aria-rowcount={grid.length}
      aria-colcount={grid[0].length}
      onMouseMove={handleMouseMove}
    >
      {renderedGrid}
    </div>
  );
};

GridBoard.propTypes = {
  grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
  onDrop: PropTypes.func.isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  previewShape: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    PropTypes.shape({
      pattern: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
      color: PropTypes.string
    })
  ]),
  previewPos: PropTypes.shape({
    row: PropTypes.number,
    col: PropTypes.number
  }),
  isMobile: PropTypes.bool,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onCellClick: PropTypes.func,
  onMouseMove: PropTypes.func,
  selectedShape: PropTypes.bool,
  cellColors: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
};

export default React.memo(GridBoard);
