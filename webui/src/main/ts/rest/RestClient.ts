
export default interface RestClient {
    getCode: (sessionId: string, onCodeReceived: (code: string) => void) => void;
}
