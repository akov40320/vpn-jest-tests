/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  verbose: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage",
  testPathIgnorePatterns: ["/node_modules/"],
};