import Axios, { AxiosResponse } from "axios";

import applicationConfig from "../config/applicationConfig"
import FirebaseDataModel from "../data/FirebaseDataModel";

export type ResponseHandler<T> = (result: T, success: boolean) => void;

export default class RestClient {

    // TODO this would be great to handle through codegen so it
    // stays consistent between TS and Julia
    public static readonly GET_CODE_PATH = "getCode";
    public static readonly COMPUTE_MODEL_PATH = "computeModel";
    public static readonly GET_RESULTS_PATH = "getModelResults";

    private readonly firebaseDataModel: FirebaseDataModel;

    public constructor(firebaseDataModel: FirebaseDataModel) {
        this.firebaseDataModel = firebaseDataModel;
    }

    public async getCode(
        modelId: string,
        onCodeReceived: ResponseHandler<string>,
    ): Promise<void> {
        await this.getString(
            "get",
            `${RestClient.GET_CODE_PATH}/${modelId}`,
            onCodeReceived
        );
    }

    private async request(
        method: "get" | "post",
        url: string,
    ): Promise<AxiosResponse> {
        const baseurl = applicationConfig.serverAddress;
        const token = await this.firebaseDataModel.getCurrentUserIdToken();
        return await Axios.request(
            {
                method,
                url: `${baseurl}/${url}`,
                headers: {
                    "Authorization": "Bearer " + token
                },
                validateStatus: () => true
            });
    }

    private isError(r: AxiosResponse): boolean {
        return r.status >= 300 || String(r.data).startsWith("Error");
    }

    private async getString(
        method: "get" | "post",
        url: string,
        onResponse: ResponseHandler<string>
    ): Promise<void> {
        this.request(method, url).then(res =>
            onResponse(
                res.data,
                !this.isError(res)
            )
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
            await this.getString(
                "post",
                `${RestClient.COMPUTE_MODEL_PATH}/${sessionId}/${scenarioName}`,
                onResponseReceived
            );
        }
    }

    public async getResults(
        resultId: string,
        onResultsReceived: (success: boolean, result?: Blob | string) => void
    ): Promise<void> {
        const baseurl = applicationConfig.serverAddress;
        await this.request(
            "get",
            `${baseurl} / ${RestClient.GET_RESULTS_PATH} / ${resultId}`
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
