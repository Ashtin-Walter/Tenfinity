import React from 'react';
import PropTypes from 'prop-types';

const GameOver = ({ onRestart, finalScore, highScore }) => {
  const isNewHighScore = finalScore > highScore;

  return (
    <div className="game-over-overlay">
      <div className="game-over-modal">
        <h2>Game Over</h2>
        {isNewHighScore && (
          <div className="new-high-score">New High Score! 🎉</div>
        )}
        <div className="final-score">Final Score: {finalScore}</div>
        <div className="high-score">High Score: {highScore}</div>
        <button 
          className="restart-btn" 
          onClick={onRestart}
          autoFocus
        >
          Play Again
        </button>
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
