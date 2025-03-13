import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

const Shape = ({ shape, onDragStart, onTouchStart, isMobile }) => {
  const handleInteraction = useCallback((e) => {
    if (isMobile) {
      onTouchStart(e);
    } else {
      onDragStart(e);
    }
  }, [isMobile, onDragStart, onTouchStart]);

  return (
    <div 
      className="shape" 
      draggable={!isMobile}
      onDragStart={!isMobile ? handleInteraction : undefined}
      onTouchStart={isMobile ? handleInteraction : undefined}
      role="button"
      tabIndex={0}
      aria-label="Draggable shape"
    >
      {shape.map((row, rowIndex) => (
        <div key={rowIndex} className="shape-row">
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex}
              className={`shape-cell ${cell ? 'filled' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

Shape.propTypes = {
  shape: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
  onDragStart: PropTypes.func.isRequired,
  onTouchStart: PropTypes.func,
  isMobile: PropTypes.bool
};

export default React.memo(Shape);
