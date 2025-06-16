import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ProfileSection from './ProfileSection';
import './SettingsMenu.css';

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
  
  // Focus the active tab when section changes
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const activeTab = menuRef.current.querySelector(`#${activeSection}-tab`);
      if (activeTab) {
        setTimeout(() => activeTab.focus(), 10);
      }
    }
  }, [activeSection, isOpen]);
  
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
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && 
                document.activeElement.classList.contains('settings-tab')) {
        // Tab navigation with arrow keys
        const tabs = Array.from(menuRef.current.querySelectorAll('.settings-tab'));
        const currentIndex = tabs.indexOf(document.activeElement);
        let newIndex;
        
        if (e.key === 'ArrowLeft') {
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        
        tabs[newIndex].focus();
        tabs[newIndex].click();
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus the first button when menu opens and ensure menu is visible
    if (isOpen && menuRef.current) {
      // Force a reflow to ensure CSS transitions work properly
      const height = menuRef.current.offsetHeight; // Store the value to avoid ESLint no-unused-expressions error
      
      // Focus the active tab
      const activeTab = menuRef.current.querySelector(`#${activeSection}-tab`);
      if (activeTab) {
        setTimeout(() => activeTab.focus(), 100);
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
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'game', label: 'Game', icon: '🎮' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'save', label: 'Save/Load', icon: '💾' },
    { id: 'help', label: 'Help', icon: '❓' }
  ];
  
  return (
    <>
      <div className="settings-backdrop visible" aria-hidden="true" onClick={onClose}></div>
      <div 
        className="settings-menu visible" // Ensure .visible is applied when isOpen is true
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
            {/* Using a more common close icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12l-4.89 4.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
            </svg>
          </button>
        </div>
        
        <div className="settings-tabs" role="tablist">
          {sections.map(section => (
            <button
              key={section.id}
              id={`${section.id}-tab`}
              className={`settings-tab ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              aria-selected={activeSection === section.id}
              aria-controls={`${section.id}-panel`}
              role="tab"
              tabIndex={activeSection === section.id ? 0 : -1}
            >
              <span className="tab-icon" aria-hidden="true">{section.icon}</span>
              <span className="tab-label">{section.label}</span>
            </button>
          ))}
        </div>
        
        <div className="settings-content">
          {/* Profile Section */}
          <div 
            id="profile-panel"
            className={`settings-panel ${activeSection === 'profile' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="profile-tab"
            tabIndex={0}
          >
            <ProfileSection user={null} onSignIn={() => {}} onSignOut={() => {}} />
            {/* TODO: Wire up user, onSignIn, onSignOut with Firebase logic */}
          </div>
          
          {/* Game Settings */}
          <div 
            id="game-panel"
            className={`settings-panel ${activeSection === 'game' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="game-tab"
            tabIndex={0}
          >
            <div className="panel-group">
              <h3 className="panel-group-title">Game Actions</h3>
              <button className="menu-btn primary-btn" onClick={onRestart}>
                <span className="btn-icon" aria-hidden="true">🔄</span> Restart Game
              </button>
            </div>
            
            <div className="panel-group">
              <h3 className="panel-group-title">Difficulty Level</h3>
              <div className="difficulty-buttons">
                {['easy', 'normal', 'hard'].map(level => (
                  <button 
                    key={level}
                    className={`menu-btn option-btn ${difficulty === level ? 'active' : ''}`} 
                    onClick={() => onChangeDifficulty(level)}
                    aria-pressed={difficulty === level}
                  >
                    <span className="difficulty-icon" aria-hidden="true">
                      {level === 'easy' ? '😊' : level === 'normal' ? '😎' : '🤯'}
                    </span>
                    <span className="btn-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  </button>
                ))}
              </div>
              
              <div className="base-difficulty-container">
                <button 
                  className={`menu-btn base-difficulty-btn ${difficulty === 'extreme' ? 'active' : ''}`} 
                  onClick={() => onChangeDifficulty('extreme')}
                  aria-pressed={difficulty === 'extreme'}
                >
                  <span className="difficulty-icon" aria-hidden="true">☠️</span>
                  <span className="btn-label">Extreme Mode</span>
                  <span className="btn-description">All shapes, maximum challenge!</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Appearance Settings */}
          <div 
            id="appearance-panel"
            className={`settings-panel ${activeSection === 'appearance' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="appearance-tab"
            tabIndex={0}
          >
            <div className="panel-group">
              <h3 className="panel-group-title">Display Mode</h3>
              <div className="mode-switch">
                <button 
                  className={`mode-option light-mode ${!darkMode ? 'active' : ''}`}
                  onClick={() => darkMode && onToggleDarkMode()}
                  aria-pressed={!darkMode}
                >
                  <span className="mode-icon" aria-hidden="true">☀️</span>
                  <span className="mode-label">Light</span>
                </button>
                <button 
                  className={`mode-option dark-mode-btn ${darkMode ? 'active' : ''}`}
                  onClick={() => !darkMode && onToggleDarkMode()}
                  aria-pressed={darkMode}
                >
                  <span className="mode-icon" aria-hidden="true">🌙</span>
                  <span className="mode-label">Dark</span>
                </button>
              </div>
            </div>
            
            <div className="panel-group">
              <h3 className="panel-group-title">Color Theme</h3>
              <div className="theme-selector">
                {['default', 'modern', 'neon'].map(themeId => (
                  <button 
                    key={themeId}
                    className={`theme-option ${theme === themeId ? 'active' : ''}`}
                    onClick={() => onChangeTheme(themeId)}
                    aria-pressed={theme === themeId}
                  >
                    <div className={`theme-preview ${themeId}-theme-preview`}>
                      <div className="theme-color-dot" style={{ background: themeId === 'default' ? '#4d61fc' : 
                                                                themeId === 'modern' ? '#00c6ff' : '#ff00cc' }}></div>
                      <div className="theme-color-dot" style={{ background: themeId === 'default' ? '#ff7e5f' : 
                                                                themeId === 'modern' ? '#0072ff' : '#333399' }}></div>
                      <div className="theme-color-dot" style={{ background: themeId === 'default' ? '#6c63ff' : 
                                                                themeId === 'modern' ? '#00a8e8' : '#ff9900' }}></div>
                    </div>
                    <span className="theme-name">{themeId.charAt(0).toUpperCase() + themeId.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Save/Load Settings */}
          <div 
            id="save-panel"
            className={`settings-panel ${activeSection === 'save' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="save-tab"
            tabIndex={0}
          >
            <div className="panel-group save-load-options">
              <h3 className="panel-group-title">Game Data</h3>
              <button className="menu-btn save-btn" onClick={onSaveGame}>
                <span className="btn-icon" aria-hidden="true">💾</span> Save Progress
              </button>
              <button className="menu-btn load-btn" onClick={onLoadGame}>
                <span className="btn-icon" aria-hidden="true">📂</span> Load Progress
              </button>
            </div>
            <div className="auto-save-info">
              <p className="info-text">
                Your game progress is also automatically saved locally.
              </p>
            </div>
          </div>
          
          {/* Help Settings */}
          <div 
            id="help-panel"
            className={`settings-panel ${activeSection === 'help' ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby="help-tab"
            tabIndex={0}
          >
            <div className="panel-group help-options">
              <h3 className="panel-group-title">Support</h3>
              <button className="menu-btn tutorial-btn" onClick={onOpenTutorial}>
                <span className="btn-icon" aria-hidden="true">📖</span> How to Play
              </button>
              <div className="keyboard-shortcuts">
                <h4 className="shortcuts-title">Keyboard Shortcuts</h4>
                <ul className="shortcuts-list">
                  <li><kbd>R</kbd> - Restart Game</li>
                  <li><kbd>H</kbd> - Show Help / Tutorial</li>
                  <li><kbd>Esc</kbd> - Close Modals</li>
                </ul>
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

// Use React.memo with a custom comparison function to prevent unnecessary re-renders
export default React.memo(SettingsMenu, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.difficulty === nextProps.difficulty &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.theme === nextProps.theme
  );
});