# Tenfinity

## Overview
Tenfinity is a web-based game inspired by the classic 1010! puzzle game. Players drop various shapes onto a 10x10 grid, aiming to create complete rows and columns to score points. This project is built using React, showcasing drag-and-drop functionality, dynamic state management, and a responsive UI.

## Features
- **Drag and Drop Mechanics**: Players can drag shapes and drop them onto the grid.
- **Score Tracking**: The game tracks the player's score based on completed lines.
- **Game Over State**: The game ends when no more shapes can be placed.
- **Responsive Design**: The interface adapts to various screen sizes.

## Technologies Used
- **React**: For building the user interface.
- **CSS**: For styling the application.
- **PropTypes**: For type checking props in React components.

## Installation
1. **Clone the Repository**
   ```bash
   git clone https://github.com/AshtinJW-Dev/tenfinity.git
   cd tenfinity
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Application**
   ```bash
   npm start
   ```
   Open your browser and navigate to `http://localhost:3000`.

## Usage
- **Drag Shapes**: Click and drag the shapes displayed to drop them onto the grid.
- **Score Points**: Complete rows or columns to score points.
- **Restart Game**: Click the "Restart Game" button to reset the grid and score.

## Components
- **App**: Main application component that holds the game logic.
- **GridBoard**: Displays the 10x10 grid and handles drop events.
- **GridCell**: Represents individual cells in the grid.
- **Shape**: Displays the shapes that can be dragged onto the grid.
- **NextShapes**: Shows the upcoming shapes to be placed.
- **ScoreBoard**: Displays the current score.
- **GameOver**: Displays when the game is over with an option to restart.

## Contributing
Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Acknowledgments
- Inspired by the 1010! puzzle game.
- Special thanks to the React community for resources and support.

