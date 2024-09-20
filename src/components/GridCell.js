import React from 'react';
import PropTypes from 'prop-types';

const GridCell = React.memo(({ filled }) => {
  const cellStyle = {
    backgroundColor: filled ? 'blue' : 'transparent',  // Ensure the color is visible
    border: '1px solid gray',  // Add borders for better visibility
  };
  return <div className="grid-cell" style={cellStyle}></div>;
});

GridCell.propTypes = {
  filled: PropTypes.bool.isRequired,
};



export default GridCell;
