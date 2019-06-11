module.exports = {
    bail: false, //whether to bail on first test failure
    globals: {
        "CUBE_NAME": "oec_indicators_i_wdi_a",
        "SERVER_URL": "https://api.oec.world/tesseract/"
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
