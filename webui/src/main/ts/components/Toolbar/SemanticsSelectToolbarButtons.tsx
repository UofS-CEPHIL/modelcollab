import { ReactElement } from "react";
import FunctionsIcon from '@mui/icons-material/Functions';
import ToolbarButtons from "./CanvasScreenToolbarButtons";
import RestClient from "../../rest/RestClient";
import { AxiosResponse } from "axios";

export default class SemanticSelectToolbarButtons extends ToolbarButtons {

    public static readonly POLLING_TIME_MS = 2000;


    public sessionId: string;
    public setButtonsToMain: () => void;
    public restClient: RestClient;
    public selectedScenario: string | null;
    public downloadData: (b: Blob, fileName: string) => void;
    public waitingForResults: boolean;
    public setWaitingForResults: (waiting: boolean) => void;


    public constructor(
        sessionId: string,
        setButtonsToMain: () => void,
        restClient: RestClient,
        selectedScenario: string | null,
        downloadData: (b: Blob, fn: string) => void,
        waitingForResults: boolean,
        setWaitingForResults: (waiting: boolean) => void,
    ) {
        super();
        this.sessionId = sessionId;
        this.setButtonsToMain = setButtonsToMain;
        this.restClient = restClient;
        this.selectedScenario = selectedScenario;
        this.downloadData = downloadData;
        this.waitingForResults = waitingForResults;
        this.setWaitingForResults = setWaitingForResults;
    }

    public handleBackButtonPressed(): void {
        this.setButtonsToMain();
    }

    public isSelected(_: string): boolean {
        return false;
    }

    public getButtons(isOpen: boolean, mode: string): ReactElement[] {
        return [
            this.getODEButton(isOpen, mode)
        ];
    }

    private getODEButton(open: boolean, mode: string): ReactElement {
        return this.makeToolbarButton(
            "ODE",
            () => this.computeModel(),
            open,
            mode,
            (<FunctionsIcon />)
        );
    }

    private computeModel(): void {
        console.log("Computing model. scenario " + this.selectedScenario);
        const pollOnce = (id: string) => {
            this.restClient.getResults(
                id,
                res => {
                    if (res.status === 200) {
                        try {
                            const blob = new Blob(
                                [res.data],
                                { type: res.headers['content-type'] }
                            );
                            this.downloadData(blob, "ModelResults.png");
                        }
                        finally {
                            this.setWaitingForResults(false);
                        }
                    }
                    else if (res.status === 204) {
                        startPolling(id);
                    }
                    else {
                        console.error("Received bad response from server");
                        console.error(res);
                        this.setWaitingForResults(false);
                    }
                },
                e => { console.error("error: " + e); this.setWaitingForResults(false); }
            );
        }
        const startPolling = (id: string) => setTimeout(() => pollOnce(id), SemanticSelectToolbarButtons.POLLING_TIME_MS);
        if (!this.waitingForResults) {
            this.restClient.computeModel(
                this.sessionId,
                this.selectedScenario,
                (res: AxiosResponse) => {
                    if (res.status === 200) {
                        this.setWaitingForResults(true);
                        startPolling(res.data);
                    }
                    else {
                        console.error("Received bad response from server");
                        console.error(res);
                        this.setWaitingForResults(false);
                    }
                },
                e => { console.error("error: " + e); this.setWaitingForResults(false); }
            );
        }
    }
}
