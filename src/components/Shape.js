import React from 'react';
import PropTypes from 'prop-types';

const Shape = ({ shape, onDragStart }) => {
  const handleDragStart = (e) => {
    console.log("Dragging shape:", shape);
    e.dataTransfer.setData('shape', JSON.stringify(shape));  // Ensure shape data is set
    if (onDragStart) onDragStart(shape);
  };
 
  return (
    <div className="shape" draggable onDragStart={handleDragStart}>
      {shape.map((row, rowIndex) => (
        <div key={rowIndex} className="shape-row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`shape-cell ${cell ? 'filled' : ''}`}></div>
          ))}
        </div>
      ))}
    </div>
  );
};


Shape.propTypes = {
  shape: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.bool)).isRequired,
  onDragStart: PropTypes.func,
};

export default Shape;
