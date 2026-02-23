const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  setupFiles: ["<rootDir>/src/tests/jest.setup.ts"],
  testTimeout: 10000,
  testMatch: ["**/?(*.)+(spec|test).ts"]
};