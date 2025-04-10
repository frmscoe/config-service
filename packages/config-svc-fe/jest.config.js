module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/src/$1", // Adjust the replacement path as necessary
    "\\.(css|scss)$": "<rootDir>/__mocks__/styleMock.js", // Add this line
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  // Other configurations...
};
