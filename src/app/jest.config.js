module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    'expo-sqlite': '<rootDir>/__tests__/__mocks__/expo-sqlite',
  },
};
