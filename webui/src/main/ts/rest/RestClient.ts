import Axios, { AxiosResponse } from "axios";
import applicationConfig from '../config/applicationConfig';

export default class RestClientImpl {

    public async getCode(
        modelId: string,
        onCodeReceived: (result: string, success: boolean) => void,
    ): Promise<void> {
        return Axios.get(
            `${applicationConfig.serverAddress}/getCode/${modelId}`,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then(res => onCodeReceived(res.data, !this.isError(res)));
    }

    private isError(r: AxiosResponse): boolean {
        return r.status >= 300 || (
            String(r.data).startsWith("Error")
        );
    }

    public async computeModel(
        sessionId: string,
        scenarioName: string | null,
        onResponseReceived: (response: string, wasSuccess: boolean) => void
    ): Promise<void> {
        if (!scenarioName) scenarioName = 'baseline';
        return Axios.post(
            `${applicationConfig.serverAddress}/computeModel/${sessionId}/${scenarioName}`,
            {
                method: 'post',
                headers: {
                    "Content-Type": "application/x-www-urlencoded"
                }
            }
        ).then(res => onResponseReceived(res.data, !this.isError(res)));
    }

    public async getResults(
        resultId: string,
        onResultsReceived: (success: boolean, result?: Blob | string) => void
    ): Promise<void> {
        return Axios.get(
            `${applicationConfig.serverAddress}/getModelResults/${resultId}`,
            {
                method: 'get',
                headers: {
                    "Content-Type": "application/x-www-urlencoded"
                },
                responseType: "arraybuffer"
            }
        ).then(res => {
            if (res.status === 204) onResultsReceived(true, undefined);
            else if (res.status === 200) onResultsReceived(
                true,
                new Blob([res.data], { type: res.headers["content-type"] })
            );
            else onResultsReceived(false, res.data);
        });
    }
}
