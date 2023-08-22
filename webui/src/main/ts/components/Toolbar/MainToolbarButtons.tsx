import { CircularProgress, Divider } from "@mui/material";
import { ReactElement } from "react";
import RestClient from "../../rest/RestClient";
import ToolbarButtons from "./CanvasScreenToolbarButtons";

import CloudIcon from '@mui/icons-material/Cloud';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import DeleteIcon from '@mui/icons-material/Delete';
import ForwardIcon from '@mui/icons-material/Forward';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import FunctionsIcon from '@mui/icons-material/Functions';
import OpenWithIcon from '@mui/icons-material/OpenWith';
import FontDownloadIcon from '@mui/icons-material/FontDownload';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import LogoutIcon from '@mui/icons-material/Logout';
import ListIcon from '@mui/icons-material/List';
import HelpIcon from '@mui/icons-material/Help';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import PublishIcon from '@mui/icons-material/Publish';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { UiMode } from "../../UiMode";
import FirebaseDataModel from "../../data/FirebaseDataModel";

export default class MainToolbarButtons extends ToolbarButtons {
    private restClient: RestClient;
    private sessionId: string;
    private firebaseDataModel: FirebaseDataModel;

    private showScenarios: () => void;
    private saveModel: () => void;
    private importModel: () => void;
    private showHelpBox: () => void;
    private returnToSessionSelect: () => void;
    private setButtonsToSemanticSelect: () => void;
    private setMode: (mode: UiMode) => void;
    private downloadData: (b: Blob, fileName: string) => void;

    public constructor(
        restClient: RestClient,
        sessionId: string,
        downloadData: (b: Blob, fn: string) => void,
        firebaseDataModel: FirebaseDataModel,
        setMode: (mode: UiMode) => void,
        showScenarios: () => void,
        saveModel: () => void,
        importModel: () => void,
        showHelpBox: () => void,
        returnToSessionSelect: () => void,
        setButtonsToSemanticSelect: () => void
    ) {
        super();
        this.restClient = restClient;
        this.sessionId = sessionId;
        this.firebaseDataModel = firebaseDataModel;
        this.showScenarios = showScenarios;
        this.showHelpBox = showHelpBox;
        this.saveModel = saveModel;
        this.importModel = importModel;
        this.returnToSessionSelect = returnToSessionSelect;
        this.setButtonsToSemanticSelect = setButtonsToSemanticSelect;
        this.setMode = setMode;
        this.downloadData = downloadData;
    }

    public handleBackButtonPressed(): void {
        // Nothing
    }

    public getButtons(mode: string, waitingForResults: boolean): ReactElement[] {
        const getLabelForInterpretButton = () => {
            if (waitingForResults) {
                return (<CircularProgress />);
            }
            else {
                return MainToolbarButtons.getDefaultComputeModelIcon();
            }
        }
        const EDIT_MODES = [
            UiMode.MOVE,
            UiMode.EDIT,
            UiMode.DELETE,
            UiMode.IDENTIFY
        ]
        const CREATE_MODES = [
            UiMode.STOCK,
            UiMode.CLOUD,
            UiMode.PARAM,
            UiMode.DYN_VARIABLE,
            UiMode.SUM_VARIABLE
        ]
        const CONNECT_MODES = [
            UiMode.FLOW,
            UiMode.CONNECT,
        ]
        return [EDIT_MODES, CONNECT_MODES, CREATE_MODES]
            .map(modeList =>
                modeList.map(uimode => this.makeToolbarButton(
                    uimode.toString(),
                    () => this.setMode(uimode),
                    mode,
                    MainToolbarButtons.getIconForMode(uimode)
                )).concat([(<Divider />)]))
            .reduce((a, b) => a.concat(b), [])
            .concat([
                (<Divider />),
                this.makeToolbarButton(
                    "Scenarios",
                    () => this.showScenarios(),
                    mode,
                    MainToolbarButtons.getScenariosIcon()
                ),
                this.makeToolbarButton(
                    "Get Code",
                    () => this.getCode(),
                    mode,
                    MainToolbarButtons.getGetCodeIcon()
                ),
                this.makeToolbarButton(
                    "Get Data",
                    () => this.getData(),
                    mode,
                    MainToolbarButtons.getGetJsonIcon()
                ),
                this.makeToolbarButton(
                    "Interpret",
                    () => this.setButtonsToSemanticSelect(),
                    mode,
                    getLabelForInterpretButton()
                ),
                this.makeToolbarButton(
                    "Publish",
                    () => this.saveModel(),
                    mode,
                    MainToolbarButtons.getPublishModelIcon()
                ),
                this.makeToolbarButton(
                    "Import",
                    () => this.importModel(),
                    mode,
                    MainToolbarButtons.getImportModelIcon()
                ),
                this.makeToolbarButton(
                    "Help",
                    () => this.showHelpBox(),
                    mode,
                    MainToolbarButtons.getHelpIcon()
                ),
                this.makeToolbarButton(
                    "Back",
                    () => this.returnToSessionSelect(),
                    mode,
                    MainToolbarButtons.getGoBackIcon()
                ),
            ]);
    }

    private getCode(): void {
        this.restClient.getCode(
            this.sessionId,
            (code: string) => this.downloadData(new Blob([code]), "Model.jl")
        );
    }

    private getData(): void {
        this.firebaseDataModel.getDataForSession(
            this.sessionId,
            (data: any) => this.downloadData(
                new Blob([JSON.stringify(data)]),
                `${this.sessionId}.json`
            )
        );
    }

    static getHelpIcon(): ReactElement {
        return (<HelpIcon />);
    }

    public static getGoBackIcon(): ReactElement {
        return (<LogoutIcon />);
    }

    public static getImportModelIcon(): ReactElement {
        return (<DownloadIcon />);
    }

    public static getGetJsonIcon(): ReactElement {
        return (<DataObjectIcon />);
    }

    public static getGetCodeIcon(): ReactElement {
        return (<CodeIcon />);
    }

    public static getScenariosIcon(): ReactElement {
        return (<ListIcon />);
    }

    public static getDefaultComputeModelIcon(): ReactElement {
        return (<PlayArrowIcon />);
    }

    public static getPublishModelIcon(): ReactElement {
        return (<PublishIcon />);
    }

    public static getIconForMode(mode: UiMode): ReactElement {
        switch (mode) {
            case UiMode.CLOUD:
                return (<CloudIcon />);
            case UiMode.CONNECT:
                return (<NorthEastIcon />);
            case UiMode.DELETE:
                return (<DeleteIcon />);
            case UiMode.DYN_VARIABLE:
                return (<AddCircleIcon />);
            case UiMode.SUM_VARIABLE:
                return (<FunctionsIcon />);
            case UiMode.EDIT:
                return (<EditIcon />);
            case UiMode.FLOW:
                return (<ForwardIcon />);
            case UiMode.IDENTIFY:
                return (<DeviceHubIcon />);
            case UiMode.MOVE:
                return (<OpenWithIcon />);
            case UiMode.PARAM:
                return (<FontDownloadIcon />);
            case UiMode.STOCK:
                return (<CheckBoxOutlineBlankIcon />);
        }
    }
}
