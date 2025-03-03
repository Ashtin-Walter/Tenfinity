import React from 'react';
import PropTypes from 'prop-types';


const GameOver = ({ onRestart }) => {
  return (
    <div className="game-over">
      <h2>Game Over</h2>
      <button className="restart-btn" onClick={onRestart}>Restart</button>
    </div>
  );
};

GameOver.propTypes = {
  onRestart: PropTypes.func.isRequired,
};

export default React.memo(GameOver);
