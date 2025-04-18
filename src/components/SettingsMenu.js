import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const SettingsMenu = ({ 
  isOpen, 
  onClose, 
  isMobile,
  onRestart,
  difficulty,
  onChangeDifficulty,
  darkMode,
  onToggleDarkMode,
  theme,
  onChangeTheme,
  onSaveGame,
  onLoadGame,
  onOpenTutorial
}) => {
  const menuRef = useRef(null);
  const [activeSection, setActiveSection] = useState('game');
  
  // Handle keyboard navigation and escape key to close menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab' && menuRef.current) {
        // Focus trap for better accessibility
        const focusableElements = menuRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (e.shiftKey && document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus the first button when menu opens
    if (isOpen && menuRef.current) {
      const firstButton = menuRef.current.querySelector('button');
      if (firstButton) {
        setTimeout(() => firstButton.focus(), 100);
      }
    }
    
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && 
          !e.target.closest('.gear-icon')) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Lock body scroll on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, isMobile]);
  
  if (!isOpen) return null;

  // Settings sections configuration
  const sections = [
    { id: 'game', label: 'Game', icon: '🎮' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'save', label: 'Save/Load', icon: '💾' },
    { id: 'help', label: 'Help', icon: '❓' }
  ];
  
  return (
    <>
      <div className="settings-backdrop" aria-hidden="true" onClick={onClose}></div>
      <div 
        className="settings-menu"
        ref={menuRef}
        role="dialog"
        aria-label="Game settings"
        aria-modal="true"
      >
        <div className="menu-header">
          <h2 className="menu-title">Settings</h2>
          <button 
            className="menu-btn close-btn" 
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="settings-tabs">
          {sections.map(section => (
            <button
              key={section.id}
              className={`settings-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              aria-selected={activeSection === section.id}
              role="tab"
            >
              <span className="tab-icon">{section.icon}</span>
              <span className="tab-label">{section.label}</span>
            </button>
          ))}
        </div>
        
        <div className="settings-content">
          {/* Game Settings */}
          <div 
            className={`settings-panel ${activeSection === 'game' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="game-tab"
          >
            <div className="panel-group">
              <button className="menu-btn primary-btn" onClick={onRestart}>
                <span className="btn-icon">🔄</span> Restart Game
              </button>
            </div>
            
            <div className="panel-group">
              <h4 className="option-title">Difficulty Level</h4>
              <div className="difficulty-buttons">
                <button 
                  className={`menu-btn option-btn ${difficulty === 'easy' ? 'active' : ''}`} 
                  onClick={() => onChangeDifficulty('easy')}
                  aria-pressed={difficulty === 'easy'}
                >
                  <span className="difficulty-icon">😊</span>
                  <span className="btn-label">Easy</span>
                </button>
                <button 
                  className={`menu-btn option-btn ${difficulty === 'normal' ? 'active' : ''}`} 
                  onClick={() => onChangeDifficulty('normal')}
                  aria-pressed={difficulty === 'normal'}
                >
                  <span className="difficulty-icon">😎</span>
                  <span className="btn-label">Normal</span>
                </button>
                <button 
                  className={`menu-btn option-btn ${difficulty === 'hard' ? 'active' : ''}`} 
                  onClick={() => onChangeDifficulty('hard')}
                  aria-pressed={difficulty === 'hard'}
                >
                  <span className="difficulty-icon">🤯</span>
                  <span className="btn-label">Hard</span>
                </button>
              </div>
              
              <div className="base-difficulty-container">
                <span className="option-title difficulty-separator">OR</span>
                <button 
                  className={`menu-btn base-difficulty-btn ${difficulty === 'extreme' ? 'active' : ''}`} 
                  onClick={() => onChangeDifficulty('extreme')}
                  aria-pressed={difficulty === 'extreme'}
                >
                  <span className="difficulty-icon">☠️</span>
                  <span className="btn-label">BASE MODE - All Shapes</span>
                  <span className="btn-description">Play with all shapes randomly mixed together</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Appearance Settings */}
          <div 
            className={`settings-panel ${activeSection === 'appearance' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="appearance-tab"
          >
            <div className="panel-group">
              <div className="mode-switch">
                <button 
                  className={`mode-option ${!darkMode ? 'active' : ''}`}
                  onClick={() => darkMode && onToggleDarkMode()}
                  aria-pressed={!darkMode}
                >
                  <span className="mode-icon">☀️</span>
                  <span className="mode-label">Light</span>
                </button>
                <div className="mode-toggle">
                  <input 
                    type="checkbox" 
                    id="dark-mode-toggle" 
                    className="toggle-checkbox" 
                    checked={darkMode}
                    onChange={onToggleDarkMode}
                    aria-label="Toggle dark mode"
                  />
                  <label htmlFor="dark-mode-toggle" className="toggle-switch"></label>
                </div>
                <button 
                  className={`mode-option ${darkMode ? 'active' : ''}`}
                  onClick={() => !darkMode && onToggleDarkMode()}
                  aria-pressed={darkMode}
                >
                  <span className="mode-icon">🌙</span>
                  <span className="mode-label">Dark</span>
                </button>
              </div>
            </div>
            
            <div className="panel-group">
              <h4 className="option-title">Color Theme</h4>
              <div className="theme-selector">
                <button 
                  className={`theme-option ${theme === 'default' ? 'active' : ''}`}
                  onClick={() => onChangeTheme('default')}
                  aria-pressed={theme === 'default'}
                >
                  <div className="theme-preview default-theme"></div>
                  <span className="theme-name">Default</span>
                </button>
                <button 
                  className={`theme-option ${theme === 'modern' ? 'active' : ''}`}
                  onClick={() => onChangeTheme('modern')}
                  aria-pressed={theme === 'modern'}
                >
                  <div className="theme-preview modern-theme"></div>
                  <span className="theme-name">Modern</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Save/Load Settings */}
          <div 
            className={`settings-panel ${activeSection === 'save' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="save-tab"
          >
            <div className="panel-group save-load-options">
              <button className="menu-btn save-btn" onClick={onSaveGame}>
                <span className="btn-icon">💾</span> Save Game
              </button>
              <button className="menu-btn load-btn" onClick={onLoadGame}>
                <span className="btn-icon">📂</span> Load Game
              </button>
            </div>
            <div className="auto-save-info">
              <p className="info-text">
                Your game progress is automatically saved when you close the window or refresh the page.
              </p>
            </div>
          </div>
          
          {/* Help Settings */}
          <div 
            className={`settings-panel ${activeSection === 'help' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="help-tab"
          >
            <div className="panel-group help-options">
              <button className="menu-btn tutorial-btn" onClick={onOpenTutorial}>
                <span className="btn-icon">📖</span> How to Play
              </button>
              <div className="keyboard-shortcuts">
                <h4 className="option-title">Keyboard Shortcuts</h4>
                <div className="shortcut-item">
                  <span className="shortcut-key">R</span>
                  <span className="shortcut-desc">Restart Game</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">H</span>
                  <span className="shortcut-desc">Open Help</span>
                </div>
                <div className="shortcut-item">
                  <span className="shortcut-key">Esc</span>
                  <span className="shortcut-desc">Close Dialogs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

SettingsMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  onRestart: PropTypes.func.isRequired,
  difficulty: PropTypes.string.isRequired,
  onChangeDifficulty: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  onToggleDarkMode: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  onChangeTheme: PropTypes.func.isRequired,
  onSaveGame: PropTypes.func.isRequired,
  onLoadGame: PropTypes.func.isRequired,
  onOpenTutorial: PropTypes.func.isRequired
};

export default React.memo(SettingsMenu);