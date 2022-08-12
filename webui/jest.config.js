module.exports = {
    roots: ["<rootDir>/src/test"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.jsx?$": "babel-jest",        
    },
    setupFilesAfterEnv: [
        "@testing-library/jest-dom/extend-expect"
    ],
    testRegex: ".+\\.test\\.tsx?$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testEnvironment: 'jsdom',
    transformIgnorePatterns: [
        "<rootDir>/node_modules/?!(@firebase|firebase)",
    ],
    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/CSSSTub.js',
    }
    
    
};
