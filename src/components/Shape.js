import React from 'react';
import PropTypes from 'prop-types';

const Shape = ({ shape, onDragStart }) => {
  return (
    <div className="shape" draggable onDragStart={onDragStart}>
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
};

export default Shape;
