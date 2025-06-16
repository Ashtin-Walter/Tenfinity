import React from 'react';
import PropTypes from 'prop-types';

const ThemePreview = ({ theme }) => {
  // Theme color mappings
  const themeColors = {
    default: {
      primary: '#4d61fc',
      secondary: '#ff7e5f',
      tertiary: '#6c63ff'
    },
    modern: {
      primary: '#00c6ff',
      secondary: '#0072ff',
      tertiary: '#00a8e8'
    },
    neon: {
      primary: '#ff00cc',
      secondary: '#333399',
      tertiary: '#ff9900'
    }
  };

  const colors = themeColors[theme] || themeColors.default;

  return (
    <div className="theme-preview-container">
      <div 
        className="theme-preview-color" 
        style={{ background: colors.primary }}
      />
      <div 
        className="theme-preview-color" 
        style={{ background: colors.secondary }}
      />
      <div 
        className="theme-preview-color" 
        style={{ background: colors.tertiary }}
      />
    </div>
  );
};

ThemePreview.propTypes = {
  theme: PropTypes.string.isRequired
};

export default ThemePreview;