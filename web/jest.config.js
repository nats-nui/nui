// module.exports = {
// 	preset: 'ts-jest',
// 	testEnvironment: 'node',
// };

// import { pathsToModuleNameMapper } from 'ts-jest/utils';
// import { compilerOptions } from './tsconfig.json';

// export default {
//   preset: 'ts-jest',
//   //testEnvironment: 'node',
//   testEnvironment: 'jest-environment-jsdom',
//   //moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: './' }),
//   moduleNameMapper: {
//     "^@/(.*)$": "<rootDir>/src/$1",
//   },
// };

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};