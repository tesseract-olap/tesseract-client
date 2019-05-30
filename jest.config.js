module.exports = {
    bail: false, //whether to bail on first test failure
    globals: {
        "CUBE_NAME": "exports_and_imports",
        "SERVER_URL": "https://data-dev.stat.ee/tesseract/"
    },
    moduleNameMapper: {
      "@datawheel/tesseract-client": "<rootDir>"
    },
    // roots: ["<rootDir>/dist/", "<rootDir>/tests/"],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    transform: { "^.+\\.js$": "babel-jest" },
    transformIgnorePatterns: ["<rootDir>/node_modules/"],
    verbose: true,
    watchPathIgnorePatterns: ["<rootDir>/node_modules/"],
};
