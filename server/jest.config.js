module.exports = {
    roots: ["<rootDir>/src/test/ts"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.jsx?$": "babel-jest",        
    },
    testRegex: "(.*|(\\.|/))\\.test\\.tsx?$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    testEnvironment: 'node',
    transformIgnorePatterns: [
        "<rootDir>/node_modules/?!(@firebase|firebase)",
    ],
    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/CSSSTub.js',
    }  
};
