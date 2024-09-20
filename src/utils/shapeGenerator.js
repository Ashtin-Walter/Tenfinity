// src/utils/shapeGenerator.js
export const getRandomShape = () => {
  const shapes = [
    [
      [true, true, true],
      [false, false, false],
      [false, false, false],
    ],
    [
      [true, true],
      [true, true],
    ],
    [
      [true],
      [true],
      [true],
    ],
    [
      [true, true, true, true],
    ],
    [
      [true, false],
      [true, true],
    ],
  ];

  const randomIndex = Math.floor(Math.random() * shapes.length);
  return shapes[randomIndex];
};
