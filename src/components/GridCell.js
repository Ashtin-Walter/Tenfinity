import React from 'react';
import PropTypes from 'prop-types';

const GridCell = React.memo(({ filled, preview }) => {
  return (
    <div className={`grid-cell ${filled ? 'filled' : ''} ${preview ? 'preview' : ''}`}></div>
  );
});

GridCell.propTypes = {
  filled: PropTypes.bool.isRequired,
  preview: PropTypes.bool, // new prop
};

export default GridCell;
