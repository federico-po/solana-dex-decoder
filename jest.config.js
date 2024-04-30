const untranspiledModulePatterns = ["@exodus/"];

module.exports = {
  testEnvironment: "node",
  transformIgnorePatterns: [
    `node_modules/(?!((jest-)?${untranspiledModulePatterns.join("|")}))`,
  ],
};
