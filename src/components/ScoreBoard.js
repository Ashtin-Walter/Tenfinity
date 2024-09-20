import React from 'react';

const ScoreBoard = React.memo(({ score }) => {
  return <div className="score-board">Score: {score}</div>;
});

export default ScoreBoard;
