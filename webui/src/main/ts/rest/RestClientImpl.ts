import Axios, { AxiosResponse } from "axios";
import ScenariosBox from "../components/ModalBox/ScenariosBox";
import applicationConfig from '../config/applicationConfig';

export default class RestClientImpl {

    public getCode(sessionId: string, onCodeReceived: (code: string) => void): void {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `${applicationConfig.serverAddress}/getCode/${sessionId}`);
        xhr.setRequestHeader("Content-Type", "application/x-www-urlencoded");
        xhr.responseType = "blob";
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                onCodeReceived(xhr.response);
            }
        }
        xhr.send();
    }

    public computeModel(
        sessionId: string,
        scenarioName: string | null,
        onResponseReceived: ((res: AxiosResponse) => void)
    ): void {
        if (!scenarioName) scenarioName = ScenariosBox.DEFAULT_SCENARIO_NAME;
        Axios.post(
            `${applicationConfig.serverAddress}/computeModel/${sessionId}/${scenarioName}`,
            {
                method: 'post',
                headers: {
                    "Content-Type": "application/x-www-urlencoded"
                }
            }
        ).then(res => onResponseReceived(res));
    }

    public getResults(resultId: string, onResultsReceived: ((res: AxiosResponse) => void)): void {
        Axios.get(
            `${applicationConfig.serverAddress}/getModelResults/${resultId}`,
            {
                method: 'get',
                headers: {
                    "Content-Type": "application/x-www-urlencoded"
                },
                responseType: "arraybuffer"
            }
        ).then(res => onResultsReceived(res));
    }
}
