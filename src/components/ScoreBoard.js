import React from 'react';
import PropTypes from 'prop-types';

const ScoreBoard = ({ score }) => {
  return <div className="score-board">Score: {score}</div>;
};

ScoreBoard.propTypes = {
  score: PropTypes.number.isRequired,
};

export default React.memo(ScoreBoard);
