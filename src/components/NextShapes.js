import React, { useMemo } from 'react';
import Shape from './Shape';
import PropTypes from 'prop-types';

const NextShapes = ({ shapes, currentShapeIndex, onDragStart }) => {
  const renderedShapes = useMemo(() => (
    shapes.map((shape, index) => (
      <div
        key={index}
        className={`shape-preview ${index === currentShapeIndex ? 'current' : ''}`}
      >
        <Shape shape={shape} onDragStart={(e) => onDragStart(e, shape)} />
      </div>
    ))
  ), [shapes, currentShapeIndex, onDragStart]);

  return (
    <div className="next-shapes">
      <h2>Next Shapes:</h2>
      <div className="shape-previews">
        {renderedShapes}
      </div>
    </div>
  );
};

NextShapes.propTypes = {
  shapes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool))).isRequired,
  currentShapeIndex: PropTypes.number.isRequired,
  onDragStart: PropTypes.func.isRequired,
};

export default React.memo(NextShapes);

