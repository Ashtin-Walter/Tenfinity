// src/utils/shapeGenerator.js
export const SHAPES = {
  easy: [
    [[true, true], [true, true]], // square
    [[true, true, true]], // line-3
    [[true, true], [true, false]], // L-small
  ],
  normal: [
    [[true, true, true], [false, true, false]], // T
    [[true, true, true, true]], // line-4
    [[true, false], [true, true], [false, true]], // Z
    [[true, true], [true, false], [true, false]], // L
  ],
  hard: [
    [[true, true, true], [true, false, false], [true, false, false]], // L-large
    [[true, false, false], [true, true, true], [false, false, true]], // snake
    [[true, true, true, true], [false, true, false, false]], // complex-1
    [[true, true, false], [false, true, true], [false, false, true]], // complex-2
  ]
};

export const getRandomShape = (difficulty = 'normal') => {
  const shapes = SHAPES[difficulty] || SHAPES.normal;
  const randomIndex = Math.floor(Math.random() * shapes.length);
  const shape = shapes[randomIndex];
  
  // Randomly rotate shape (0, 90, 180, or 270 degrees)
  const rotations = Math.floor(Math.random() * 4);
  return rotateShape(shape, rotations);
};

const rotateShape = (shape, times) => {
  let rotated = shape;
  for (let i = 0; i < times; i++) {
    rotated = rotated[0].map((_, index) =>
      rotated.map(row => row[index]).reverse()
    );
  }
  return rotated;
};
