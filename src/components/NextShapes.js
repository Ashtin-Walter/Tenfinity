import React, { useMemo } from 'react';
import Shape from './Shape';
import PropTypes from 'prop-types';

const NextShapes = ({ shapes, onDragStart, onTouchStart, isMobile }) => {
  const renderedShapes = useMemo(() => (
    shapes.map((shape, index) => 
      shape ? (
        <div key={index} className="shape-preview">
          <Shape 
            shape={shape} 
            onDragStart={(e) => onDragStart(e, index, shape)}
            onTouchStart={(e) => onTouchStart(e, index, shape)}
            isMobile={isMobile}
          />
        </div>
      ) : (
        <div key={index} className="shape-preview empty" />
      )
    )
  ), [shapes, onDragStart, onTouchStart, isMobile]);

  return (
    <div className="next-shapes">
      <div className="shape-previews">{renderedShapes}</div>
    </div>
  );
};

NextShapes.propTypes = {
  shapes: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)),
    PropTypes.oneOf([null])
  ])).isRequired,
  onDragStart: PropTypes.func.isRequired,
  onTouchStart: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default React.memo(NextShapes);

