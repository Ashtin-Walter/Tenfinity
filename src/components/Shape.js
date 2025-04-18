import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const Shape = ({ shape, onDragStart, onTouchStart, isMobile, onShapeClick, isSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // Extract pattern and color from the shape
  const { pattern, color } = useMemo(() => {
    return {
      pattern: shape.pattern || shape,
      color: shape.color || 'var(--accent-color)'
    };
  }, [shape]);
  
  const handleInteraction = useCallback((e) => {
    if (isMobile) {
      onTouchStart(e);
    } else {
      setIsDragging(true);
      onDragStart(e);
    }
  }, [isMobile, onDragStart, onTouchStart]);
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e) => {
    if (onShapeClick) {
      e.stopPropagation(); // Prevent click from propagating
      onShapeClick();
    }
  }, [onShapeClick]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onShapeClick && onShapeClick();
    }
  }, [onShapeClick]);

  return (
    <div 
      className={`shape ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`} 
      draggable={!isMobile}
      onDragStart={!isMobile ? handleInteraction : undefined}
      onDragEnd={!isMobile ? handleDragEnd : undefined}
      onTouchStart={isMobile ? handleInteraction : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Draggable shape${isSelected ? ' (selected)' : ''}`}
      aria-pressed={isSelected}
      style={{ 
        '--shape-color': color,
        transform: isSelected ? 'scale(1.1)' : undefined
      }}
    >
      {pattern.map((row, rowIndex) => (
        <div key={rowIndex} className="shape-row">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={`shape-cell ${cell ? 'filled' : ''}`}
              style={cell ? { backgroundColor: color } : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

Shape.propTypes = {
  shape: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    PropTypes.shape({
      pattern: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
      color: PropTypes.string,
      name: PropTypes.string
    })
  ]).isRequired,
  onDragStart: PropTypes.func.isRequired,
  onTouchStart: PropTypes.func,
  isMobile: PropTypes.bool,
  onShapeClick: PropTypes.func,
  isSelected: PropTypes.bool
};

export default React.memo(Shape);
