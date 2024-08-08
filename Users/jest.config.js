module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/src'], // Adjust the root directory to match your project structure
    transform: {
      '^.+\\.ts?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  };
  