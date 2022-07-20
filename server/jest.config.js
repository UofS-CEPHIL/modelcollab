module.exports = {
    roots: ["<rootDir>/src"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
        "^.+\\.jsx?$": "babel-jest",        
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    moduleFileExtensions: ["ts", "js", "json", "node"],
    testEnvironment: 'node',
    transformIgnorePatterns: [
        "<rootDir>/node_modules/?!(@firebase|firebase)",
    ],
    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/CSSSTub.js',
    }  
};
