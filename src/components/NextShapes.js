import React, { useMemo, memo } from 'react';
import Shape from './Shape';
import PropTypes from 'prop-types';

const NextShapes = ({ shapes, onDragStart, onTouchStart, isMobile, onShapeClick, selectedShapeIndex }) => {
  const renderedShapes = useMemo(() => (
    shapes.map((shape, index) => (
      <div 
        key={index} 
        className={`shape-preview ${!shape ? 'empty' : ''} ${selectedShapeIndex === index ? 'selected' : ''}`}
        role={shape ? 'button' : 'presentation'}
        aria-label={shape ? `Shape option ${index + 1}` : 'Empty shape slot'}
      >
        {shape && (
          <Shape 
            shape={shape} 
            onDragStart={(e) => onDragStart(e, index, shape)}
            onTouchStart={(e) => onTouchStart(e, index, shape)}
            onShapeClick={() => onShapeClick?.(index, shape)}
            isSelected={selectedShapeIndex === index}
            isMobile={isMobile}
          />
        )}
      </div>
    ))
  ), [shapes, onDragStart, onTouchStart, onShapeClick, selectedShapeIndex, isMobile]);

  return (
    <div className="shape-previews" aria-label="Available shapes">
      {renderedShapes}
    </div>
  );
};

NextShapes.propTypes = {
  shapes: PropTypes.array.isRequired,
  onDragStart: PropTypes.func,
  onTouchStart: PropTypes.func,
  isMobile: PropTypes.bool,
  onShapeClick: PropTypes.func,
  selectedShapeIndex: PropTypes.number
};

export default memo(NextShapes);