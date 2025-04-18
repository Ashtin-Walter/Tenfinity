import React from 'react';
import PropTypes from 'prop-types';

const GridCell = React.memo(({ filled, preview, color }) => {
  return (
    <div 
      className={`grid-cell ${filled ? 'filled' : ''} ${preview ? 'preview' : ''}`}
      style={{
        backgroundColor: filled && color ? color : undefined,
        borderColor: preview && color ? color : undefined,
        boxShadow: filled && color ? `0 0 15px ${color}` : undefined
      }}
    ></div>
  );
});

GridCell.propTypes = {
  filled: PropTypes.bool.isRequired,
  preview: PropTypes.bool,
  color: PropTypes.string
};

export default GridCell;
