import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.exports = {"__esModule": true};

// Disable console output
global.console.warn = jest.fn();
global.console.error = jest.fn();


export function fail() {
    expect(0).toBe(1);
}
