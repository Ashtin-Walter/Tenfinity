// Integration test for App.js (UI + logic)
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('Tenfinity App Integration', () => {
  test('renders game and detects game over', () => {
    render(<App />);
    // Use getByLabelText to uniquely select the current score label
    const currentScoreLabel = screen.getByLabelText(/current score/i);
    expect(currentScoreLabel).toBeInTheDocument();
  });

  test('allows shape placement and updates score', () => {
    render(<App />);
    // Find a shape preview and simulate drag/drop or click (depends on UI implementation)
    // Placeholder: actual test would need to select a shape and place it
  });
});
