import React from 'react';

const GameOver = React.memo(({ onRestart }) => {
  return (
    <div className="game-over">
      <h2>Game Over</h2>
      <button className="restart-btn" onClick={onRestart}>Restart</button>
    </div>
  );
});

export default GameOver;
