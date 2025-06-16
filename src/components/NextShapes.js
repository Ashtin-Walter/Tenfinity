import React, { useMemo, memo } from 'react';
import Shape from './Shape';
import PropTypes from 'prop-types';

const NextShapes = ({ shapes, onDragStart, onTouchStart, isMobile, onShapeClick, selectedShapeIndex }) => {
  const renderedShapes = useMemo(() => (
    shapes.map((shape, index) => 
      shape ? (
        <div key={index} className="shape-preview">
          <Shape 
            shape={shape} 
            onDragStart={(e) => onDragStart(e, index, shape)}
            onTouchStart={(e) => onTouchStart(e, index, shape)}
            onShapeClick={() => onShapeClick && onShapeClick(index, shape)}
            isSelected={selectedShapeIndex === index}
            isMobile={isMobile}
          />
        </div>
      ) : (
        <div key={index} className="shape-preview empty" />
      )
    )
  ), [shapes, onDragStart, onTouchStart, onShapeClick, selectedShapeIndex, isMobile]);

  return (
    <div className="next-shapes">
      <div className="shape-previews">{renderedShapes}</div>
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

