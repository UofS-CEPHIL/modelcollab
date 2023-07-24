import { AxiosResponse } from "axios";

export default interface RestClient {
    getCode: (sessionId: string, onCodeReceived: (code: string) => void) => void;
    computeModel: (sessionId: string, scenarioName: string | null, onResponseReceived: ((res: AxiosResponse) => void), onFailed: ((reason: any) => void)) => void;
    getResults: (sessionId: string, onResultsReceived: ((res: AxiosResponse) => void), onFailed: ((reason: any) => void)) => void;
}
