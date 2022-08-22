module.exports = {
    roots: ["<rootDir>/src/test"],
    transform: {
        "^.+\\.[t|j]sx?$": "ts-jest"           
    },
    setupFilesAfterEnv: [
        "@testing-library/jest-dom/extend-expect"
    ],
    testRegex: ".+\\.test\\.tsx?$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
        "node_modules/(?!(konva)).*\\.js$",
        "<rootDir>/node_modules/?!(@firebase|firebase)",
    ],
    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/CSSSTub.js',
    }
    
    
};
