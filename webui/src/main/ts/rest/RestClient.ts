import Axios, { AxiosResponse } from "axios";

export default class RestClient {

    // TODO this would be great to handle through codegen so it
    // stays consistent between TS and Julia
    public static readonly GET_CODE_PATH = "getCode";
    public static readonly COMPUTE_MODEL_PATH = "computeModel";
    public static readonly GET_RESULTS_PATH = "getModelResults";

    public async getCode(
        modelId: string,
        onCodeReceived: (result: string, success: boolean) => void,
    ): Promise<void> {
        return Axios.get(
            `/api/${RestClient.GET_CODE_PATH}/${modelId}`,
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
        if (!scenarioName) {
            onResponseReceived("Please select a scenario!", false);
            return new Promise(() => { });
        }
        else {
            return Axios.post(
                `/api/${RestClient.COMPUTE_MODEL_PATH}`
                + `/${sessionId}/${scenarioName}`,
                {
                    headers: {
                        "Content-Type": "application/x-www-urlencoded"
                    }
                }
            ).then(res => onResponseReceived(res.data, !this.isError(res)));
        }
    }

    public async getResults(
        resultId: string,
        onResultsReceived: (success: boolean, result?: Blob | string) => void
    ): Promise<void> {
        return Axios.get(
            `/api/${RestClient.GET_RESULTS_PATH}/${resultId}`,
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
