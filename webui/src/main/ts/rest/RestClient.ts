import { AxiosResponse } from "axios";

export default interface RestClient {
    getCode: (sessionId: string, onCodeReceived: (code: string) => void) => void;
    computeModel: (sessionId: string, onResponseReceived: ((res: AxiosResponse) => void)) => void;
    getResults: (sessionId: string, onResultsReceived: ((res: AxiosResponse) => void)) => void;
}
