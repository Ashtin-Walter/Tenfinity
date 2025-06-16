import React, { useMemo, memo } from 'react';
import PropTypes from 'prop-types';

const ScoreBoard = ({ score, highScore }) => {
  // Calculate level based on score
  const level = useMemo(() => {
    return Math.floor(score / 10) + 1;
  }, [score]);  return (
    <div className="score-board" role="region" aria-label="Game Score Information">
      <div className="score-item current-score">
        <span className="score-label" aria-label="Current Score">Score</span>
        <span className="score-value" aria-live="polite">{score}</span>
      </div>
      <div className="score-item high-score">
        <span className="score-label" aria-label="High Score">Best</span>
        <span className="score-value">{highScore}</span>
      </div>
      <div className="score-item level">
        <span className="score-label" aria-label="Current Level">Level</span>
        <span className="score-value" aria-live="polite">{level}</span>
      </div>
    </div>
  );
};

ScoreBoard.propTypes = {
  score: PropTypes.number.isRequired,
  highScore: PropTypes.number.isRequired
};

export default memo(ScoreBoard);
