import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './GameOver.css';

const GameOver = ({ onRestart, finalScore, highScore }) => {
  const isNewHighScore = finalScore > highScore;
  const [displayScore, setDisplayScore] = useState(0);

  // Calculate stats to display
  const percentOfHigh = highScore > 0 ? Math.round((finalScore / highScore) * 100) : 100;
  
  // Animate score counting up
  useEffect(() => {
    if (finalScore > 0) {
      const duration = 1500; // ms
      const interval = 20;
      const steps = duration / interval;
      const increment = finalScore / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalScore) {
          setDisplayScore(finalScore);
          clearInterval(timer);
          // Score animation complete
        } else {
          setDisplayScore(Math.floor(current));
        }
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [finalScore, isNewHighScore]);
  
  return (
    <div className="game-over-overlay"> 
      <div className="game-over-modal">
        <h2>Game Over</h2>
        
        {isNewHighScore && (
          <div className="new-high-score">
            <div className="celebration">🎉</div>
            <div className="high-score-text">New High Score!</div>
            <div className="celebration">🎉</div>
          </div>
        )}
        
        <div className="score-details">
          <div className="final-score">
            <span className="score-label">Final Score:</span> 
            <span className="score-value">{displayScore}</span>
          </div>
          
          <div className="high-score">
            <span className="score-label">High Score:</span> 
            <span className="score-value">{highScore}</span>
          </div>
          
          {!isNewHighScore && highScore > 0 && (
            <div className="score-percentage">
              <span className="score-label">Performance:</span>
              <span className="score-value">{percentOfHigh}% of your best</span>
            </div>
          )}
        </div>
        
        <button 
          className="restart-btn" 
          onClick={onRestart}
          autoFocus
        >
          <span>Play Again</span>
        </button>
        
        <div className="share-score">
          <button 
            className="share-btn"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Tenfinity Score',
                  text: `I scored ${finalScore} points in Tenfinity!${isNewHighScore ? ' (New High Score!)' : ''}`,
                  url: window.location.href,
                }).catch(err => console.error('Error sharing:', err));
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share Score
          </button>
        </div>
      </div>
    </div>
  );
};

GameOver.propTypes = {
  onRestart: PropTypes.func.isRequired,
  finalScore: PropTypes.number.isRequired,
  highScore: PropTypes.number.isRequired
};

export default React.memo(GameOver);
