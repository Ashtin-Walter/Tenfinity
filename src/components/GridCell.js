import React from 'react';
import PropTypes from 'prop-types';

const GridCell = React.memo(({ filled }) => {
  return <div className={`grid-cell ${filled ? 'filled' : ''}`}></div>;
});

GridCell.propTypes = {
  filled: PropTypes.bool.isRequired,
};

export default GridCell;
