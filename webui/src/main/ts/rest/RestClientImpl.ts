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
}
