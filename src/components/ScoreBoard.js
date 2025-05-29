import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const ScoreBoard = ({ score, highScore }) => {
  // Calculate level based on score
  const level = useMemo(() => {
    return Math.floor(score / 10) + 1;
  }, [score]);

  return (
    <div className="score-board">
      <div className="score-item current-score">
        <span className="score-label">Score</span><br></br>
        <span className="score-value">{score}</span>
      </div>
      <div className="score-item high-score">
        <span className="score-label">Best</span><br></br>
        <span className="score-value">{highScore}</span>
      </div>
      <div className="score-item level">
        <span className="score-label">Level</span><br></br>
        <span className="score-value">{level}</span>
      </div>
    </div>
  );
};

ScoreBoard.propTypes = {
  score: PropTypes.number.isRequired,
  highScore: PropTypes.number.isRequired,
};

export default React.memo(ScoreBoard);
