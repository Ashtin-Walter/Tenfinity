import React from 'react';
import PropTypes from 'prop-types';

const GridCell = React.memo(({ filled, preview, invalid, color, canPlace }) => {
  const getPreviewClass = () => {
    if (!preview) return '';
    if (canPlace === false) return 'preview invalid';
    if (canPlace === true) return 'preview valid';
    return 'preview'; // Default preview state when canPlace is undefined
  };

  return (
    <div 
      className={`grid-cell ${filled ? 'filled' : ''} ${getPreviewClass()}`}
      style={{
        backgroundColor: (filled && color ? color : undefined),
        // Remove inline styles for preview as they're now handled by CSS classes
      }}
    ></div>
  );
});

GridCell.propTypes = {
  filled: PropTypes.bool.isRequired,
  preview: PropTypes.bool,
  invalid: PropTypes.bool,
  color: PropTypes.string,
  canPlace: PropTypes.bool
};

export default GridCell;
