import React from 'react';
import PropTypes from 'prop-types';

const GameOver = ({ onRestart, finalScore, highScore }) => {
  const isNewHighScore = finalScore > highScore;

  // Calculate stats to display
  const percentOfHigh = highScore > 0 ? Math.round((finalScore / highScore) * 100) : 100;
  
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
            <span className="score-value">{finalScore}</span>
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
          Play Again
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
