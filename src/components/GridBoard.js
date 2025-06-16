import React, { memo, useCallback, useMemo, useRef, useEffect } from "react";
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
  const lastTouchRef = useRef(null);
  const gridRef = useRef(null);
  
  // Clean up any lingering throttle timeouts on unmount
  useEffect(() => {
    return () => {
      if (lastTouchRef.current) {
        lastTouchRef.current = null;
      }
    };
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    onDragOver(e);
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
    if (e.touches?.[0]) {
      lastTouchRef.current = {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        target: e.currentTarget,
        timestamp: Date.now()
      };
    }
    
    onTouchStart?.(e);
  }, [onTouchStart]);

  const handleTouchMoveOptimized = useCallback((e) => {
    if (previewShape) {
      e.preventDefault();
    }

    if (e.touches?.[0]) {
      const touch = e.touches[0];
      lastTouchRef.current = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        timestamp: Date.now()
      };
      
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (el) {
        const cellContainer = el.closest('.grid-cell-container');
        if (cellContainer) {
          handleDragOver({ currentTarget: cellContainer, preventDefault: () => {} });
        } else {
          onDragLeave?.(e);
        }
      }
    }

    onTouchMove?.(e);
  }, [previewShape, handleDragOver, onDragLeave, onTouchMove]);

  const handleTouchEndOptimized = useCallback((e) => {
    if (lastTouchRef.current?.clientX) {
      const targetElement = document.elementFromPoint(
        lastTouchRef.current.clientX,
        lastTouchRef.current.clientY
      );
      
      if (targetElement) {
        const cellContainer = targetElement.closest('.grid-cell-container');
        if (cellContainer?.dataset.row !== undefined) {
          const syntheticEvent = {
            ...e,
            currentTarget: cellContainer,
            target: cellContainer
          };
          
          onTouchEnd?.(syntheticEvent);
          lastTouchRef.current = null;
          return;
        }
      }
    }
    
    onTouchEnd?.(e);
    lastTouchRef.current = null;
  }, [onTouchEnd]);

  // Get shape color for preview
  const previewColor = useMemo(() => 
    previewShape?.color || 'var(--accent-color)'
  , [previewShape]);

  // Extract the pattern from shape object if needed
  const shapePattern = useMemo(() => 
    previewShape ? (previewShape.pattern || previewShape) : null
  , [previewShape]);

  // Use useMemo to optimize the grid rendering
  const renderedGrid = useMemo(() => {
    return grid.map((row, rowIndex) => 
      row.map((cell, cellIndex) => {
        let showPreview = false;
        let cellColor = cell && cellColors ? cellColors[rowIndex][cellIndex] : null;
        
        if (shapePattern && previewPos) {
          const shapeRow = rowIndex - previewPos.row;
          const shapeCol = cellIndex - previewPos.col;
          
          showPreview = 
            shapeRow >= 0 &&
            shapeRow < shapePattern.length &&
            shapeCol >= 0 &&
            shapeCol < shapePattern[0].length &&
            shapePattern[shapeRow][shapeCol];
        }
        
        // Use enhanced canPlace validation from App.js if available
        const canPlaceAtPosition = previewPos && typeof previewPos.canPlace === 'boolean' 
          ? previewPos.canPlace 
          : !cell;
          
        const isInvalidCell = showPreview && !canPlaceAtPosition;
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
          >
            <GridCell 
              filled={cell}
              preview={showPreview && canPlaceAtPosition}
              invalid={isInvalidCell}
              canPlace={canPlaceAtPosition}
              color={isInvalidCell ? undefined : (showPreview ? previewColor : cellColor)}
              mobile={isMobile}
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
    if (selectedShape && previewPos?.canPlace) {
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
  grid: PropTypes.array.isRequired,
  onDrop: PropTypes.func,
  onDragOver: PropTypes.func,
  onDragLeave: PropTypes.func,
  previewShape: PropTypes.object,
  previewPos: PropTypes.object,
  isMobile: PropTypes.bool,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func,
  onCellClick: PropTypes.func,
  onMouseMove: PropTypes.func,
  selectedShape: PropTypes.bool,
  cellColors: PropTypes.array
};

export default memo(GridBoard);