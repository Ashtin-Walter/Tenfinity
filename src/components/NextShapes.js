import React, { useMemo } from 'react';
import Shape from './Shape';
import PropTypes from 'prop-types';

const NextShapes = ({ shapes, onDragStart }) => {
  const renderedShapes = useMemo(() => (
    shapes.map((shape, index) => 
      shape ? (
        <div key={index} className="shape-preview">
          <Shape shape={shape} onDragStart={(e) => onDragStart(e, index, shape)} />
        </div>
      ) : (
        <div key={index} className="shape-preview empty">
          {/* ...empty placeholder... */}
        </div>
      )
    )
  ), [shapes, onDragStart]);

  return (
    <div className="next-shapes">
      <div className="shape-previews">
        {renderedShapes}
      </div>
    </div>
  );
};

NextShapes.propTypes = {
  shapes: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    PropTypes.oneOf([null])
  ])).isRequired,
  onDragStart: PropTypes.func.isRequired,
};

export default React.memo(NextShapes);

