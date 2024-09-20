import React from 'react';
import Shape from './Shape';
import PropTypes from 'prop-types';

const NextShapes = React.memo(({ shapes, currentShapeIndex }) => {
  return (
    <div className="next-shapes">
      <h2>Next Shapes:</h2>
      <div className="shape-previews">
        {shapes.map((shape, index) => (
          <div
            key={index}
            className={`shape-preview ${index === currentShapeIndex ? 'current' : ''}`}
          >
            <Shape shape={shape} />
          </div>
        ))}
      </div>
    </div>
  );
});

NextShapes.propTypes = {
  shapes: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool))).isRequired,
  currentShapeIndex: PropTypes.number.isRequired,
};

export default NextShapes;

