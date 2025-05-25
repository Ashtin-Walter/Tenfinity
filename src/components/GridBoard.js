import React, { useCallback, useMemo, useRef, useEffect } from "react";
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
  // Add touch tracking refs for better mobile interaction
  const touchMoveThrottleRef = useRef(null);
  const lastTouchRef = useRef(null);
  const gridRef = useRef(null);
  
  // Clean up any lingering throttle timeouts on unmount
  useEffect(() => {
    return () => {
      if (touchMoveThrottleRef.current) {
        clearTimeout(touchMoveThrottleRef.current);
      }
    };
  }, []);

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

  // Enhanced touch handlers for mobile
  const handleTouchStartOptimized = useCallback((e) => {
    // Only store the touch position and forward the event
    if (e.touches && e.touches[0]) {
      lastTouchRef.current = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        target: e.currentTarget,
        timestamp: Date.now()
      };
    }
    
    // Call the parent handler
    if (onTouchStart) {
      onTouchStart(e);
    }
  }, [onTouchStart]);

  const handleTouchMoveOptimized = useCallback((e) => {
    // Prevent default to avoid scrolling while dragging
    if (previewShape) {
      e.preventDefault();
    }

    // Update last touch coordinates
    if (e.touches && e.touches[0]) {
      lastTouchRef.current = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        timestamp: Date.now()
      };
    }

    // Map touch move to dragOver for preview on mobile
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el) {
        const cellContainer = el.closest('.grid-cell-container');
        if (cellContainer) {
          // Simulate dragOver on this cell
          handleDragOver({ currentTarget: cellContainer, preventDefault: () => {} });
        } else {
          // left the board
          onDragLeave && onDragLeave(e);
        }
      }
    }

    // Forward to parent touch move handler
    if (onTouchMove) {
      onTouchMove(e);
    }

    // Throttle logic removed - handled in App.js
  }, [previewShape, handleDragOver, onDragLeave, onTouchMove]);

  const handleTouchEndOptimized = useCallback((e) => {
    // Clear any throttle timeouts
    if (touchMoveThrottleRef.current) {
      clearTimeout(touchMoveThrottleRef.current);
      touchMoveThrottleRef.current = null;
    }
    
    // If we have the last touch position, use elementFromPoint to find the target
    if (lastTouchRef.current && lastTouchRef.current.clientX) {
      const targetElement = document.elementFromPoint(
        lastTouchRef.current.clientX,
        lastTouchRef.current.clientY
      );
      
      // If we found a cell, get its row and column
      if (targetElement) {
        const cellContainer = targetElement.closest('.grid-cell-container');
        if (cellContainer && cellContainer.dataset.row !== undefined) {
          
          
          // Create a synthetic event with the correct target
          const syntheticEvent = {
            ...e,
            currentTarget: cellContainer,
            target: cellContainer
          };
          
          // Call the parent handler with our synthetic event
          if (onTouchEnd) {
            onTouchEnd(syntheticEvent);
          }
          
          // Reset the last touch
          lastTouchRef.current = null;
          return;
        }
      }
    }
    
    // Fallback to normal handling if we couldn't determine the target
    if (onTouchEnd) {
      onTouchEnd(e);
    }
    
    // Reset the last touch
    lastTouchRef.current = null;
  }, [onTouchEnd]);

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
        
        // Use enhanced canPlace validation from App.js if available, fallback to simple collision check
        const canPlaceAtPosition = previewPos && typeof previewPos.canPlace === 'boolean' 
          ? previewPos.canPlace 
          : !cell; // Fallback: can place if cell is empty
          
        const isInvalidCell = showPreview && !canPlaceAtPosition;
        
        // Create a proper ARIA label for accessibility
        const ariaLabel = `Grid cell at row ${rowIndex + 1}, column ${cellIndex + 1}${cell ? ', filled' : ''}${showPreview ? ', preview' : ''}${isInvalidCell ? ', invalid' : ''}`;
        
        return (
          <div
            key={`${rowIndex}-${cellIndex}`}
            data-row={rowIndex}
            data-col={cellIndex}
            className={`grid-cell-container ${selectedShape ? 'cell-clickable' : ''}`}
            onDragOver={!isMobile ? handleDragOver : undefined}
            onDragLeave={!isMobile ? onDragLeave : undefined}
            onDrop={!isMobile ? (e) => handleDrop(e, rowIndex, cellIndex) : undefined}
            onTouchStart={isMobile ? handleTouchStartOptimized : undefined}
            onTouchMove={isMobile ? handleTouchMoveOptimized : undefined}
            onTouchEnd={isMobile ? handleTouchEndOptimized : undefined}
            onTouchCancel={isMobile ? handleTouchEndOptimized : undefined}
            onClick={() => handleCellClick(rowIndex, cellIndex)}
            role="gridcell"
            aria-label={ariaLabel}
            aria-colindex={cellIndex + 1}
            aria-rowindex={rowIndex + 1}
          >            <GridCell 
              filled={cell}
              preview={showPreview && canPlaceAtPosition}
              invalid={isInvalidCell}
              canPlace={canPlaceAtPosition}
              color={isInvalidCell ? undefined : (showPreview ? previewColor : cellColor)}
              mobile={isMobile} // know mobile to offset preview
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
    handleTouchStartOptimized, 
    handleTouchMoveOptimized, 
    handleTouchEndOptimized, 
    handleCellClick, 
    selectedShape, 
    cellColors,
    previewColor
  ]);

  const handleBoardClick = useCallback((e) => {
    if (selectedShape && previewPos && previewPos.canPlace) {
      onCellClick(previewPos.row, previewPos.col);
    }
  }, [selectedShape, previewPos, onCellClick]);

  return (
    <div 
      className={`grid-board ${selectedShape ? 'shape-selected' : ''} ${isMobile ? 'mobile-grid' : ''}`}
      role="grid" 
      aria-label="Game grid board"
      aria-rowcount={grid.length}
      aria-colcount={grid[0].length}
      onMouseMove={handleMouseMove}
      onClick={!isMobile ? handleBoardClick : undefined}
      ref={gridRef}
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
    col: PropTypes.number,
    canPlace: PropTypes.bool,
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
