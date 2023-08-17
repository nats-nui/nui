// module.exports = {
// 	preset: 'ts-jest',
// 	testEnvironment: 'node',
// };

// import { pathsToModuleNameMapper } from 'ts-jest/utils';
// import { compilerOptions } from './tsconfig.json';

export default {
  preset: 'ts-jest',
  //testEnvironment: 'node',
  testEnvironment: 'jest-environment-jsdom',
  //moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: './' }),
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};