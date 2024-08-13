module.exports = {
    verbose: true,
    roots: [
        "<rootDir>/src/test"
    ],
    globals: {
        "ts-jest": {
            useESM: true,
        },
    },
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    resolver: "<rootDir>/src/test/ts/jest.resolver.ts",
    preset: "ts-jest",
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },
    transformIgnorePatterns: [
        "<rootDir>/node_modules/?!(@firebase|firebase)",
        "<rootDir>/node_modules/?!(@maxgraph|maxgraph)",
        "<rootDir>/node_modules/?!(whatwg-url)",
    ],
    setupFilesAfterEnv: [
        "@testing-library/jest-dom/extend-expect",
        "<rootDir>/src/test/ts/jest.setup.js"
    ],
    testRegex: ".test.tsx?$",
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        customExportConditions: [''],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/CSSSTub.js',
        "uuid": require.resolve("uuid"),
        "@maxgraph/core": "<rootDir>/node_modules/@maxgraph/core/dist/"
    },
    moduleDirectories: [
        "<rootDir>/node_modules",
        "<rootDir>/src/test/ts"
    ],
};
