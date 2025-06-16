import React, { useMemo, memo, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './ScoreBoard.css';

const ScoreBoard = ({ score, highScore }) => {
  const [prevScore, setPrevScore] = useState(score);
  const [prevHighScore, setPrevHighScore] = useState(highScore);
  const [isScoreUpdated, setIsScoreUpdated] = useState(false);
  const [isHighScoreUpdated, setIsHighScoreUpdated] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  
  const prevLevelRef = useRef(1);
  
  // Calculate level based on score
  const level = useMemo(() => {
    return Math.floor(score / 10) + 1;
  }, [score]);
  
  // Handle score animation
  useEffect(() => {
    if (score > prevScore) {
      setIsScoreUpdated(true);
      setTimeout(() => setIsScoreUpdated(false), 500);
      setPrevScore(score);
    }
  }, [score, prevScore]);
  
  // Handle high score animation
  useEffect(() => {
    if (highScore > prevHighScore) {
      setIsHighScoreUpdated(true);
      setTimeout(() => setIsHighScoreUpdated(false), 500);
      setPrevHighScore(highScore);
    }
  }, [highScore, prevHighScore]);
  
  // Handle level up animation
  useEffect(() => {
    if (level > prevLevelRef.current) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 1500);
    }
    prevLevelRef.current = level;
  }, [level]);
  
  return (
    <div className="score-board" role="region" aria-label="Game Score Information">
      <div className="score-item current-score">
        <span className="score-label" aria-label="Current Score">Score</span>
        <span className={`score-value ${isScoreUpdated ? 'updated' : ''}`} aria-live="polite">{score}</span>
      </div>
      
      <div className="score-item high-score">
        <span className="score-label" aria-label="High Score">Best</span>
        <span className={`score-value ${isHighScoreUpdated ? 'updated' : ''}`}>{highScore}</span>
        {isHighScoreUpdated && <div className="new-high-indicator">New Best!</div>}
      </div>
      
      <div className="score-item level">
        <span className="score-label" aria-label="Current Level">Level</span>
        <span className={`score-value ${showLevelUp ? 'updated' : ''}`} aria-live="polite">{level}</span>
        {showLevelUp && <div className="level-up-indicator">Level Up!</div>}
      </div>
    </div>
  );
};

ScoreBoard.propTypes = {
  score: PropTypes.number.isRequired,
  highScore: PropTypes.number.isRequired
};

export default memo(ScoreBoard);
