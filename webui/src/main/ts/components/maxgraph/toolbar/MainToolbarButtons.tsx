import { Divider, List } from "@mui/material";
import { ReactElement } from "react";
import { UiMode } from "../../../UiMode";
import ToolbarButtons from "./ToolbarButtons";
import NorthEastIcon from '@mui/icons-material/NorthEast';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import EastIcon from '@mui/icons-material/East';
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
import ModalBoxType from "../../ModalBox/ModalBoxType";
import RestClient from "../../../rest/RestClient";
import FirebaseDataModel from "../../../data/FirebaseDataModel";

export interface Props {
    mode: UiMode;
    open: boolean;
    changeMode: (mode: UiMode) => void;
    setOpenModalBox: (boxType: ModalBoxType) => void;
    sessionId: string;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
    goToSemanticSelect: () => void;
    exitCanvasScreen: () => void;
}

export default class MainToolbarButtons extends ToolbarButtons<Props> {

    protected getButtons(): ReactElement[] {
        return Object.values(UiMode)
            .map(uimode =>
                this.makeToolbarButton(
                    uimode.toString(),
                    () => this.props.changeMode(uimode),
                    true,
                    MainToolbarButtons.getIconForMode(uimode),
                    this.props.mode
                )
            ).concat([
                (<Divider key={"divider"} />),
                this.makeToolbarButton(
                    "Scenarios",
                    () => this.props.setOpenModalBox(
                        ModalBoxType.SELECT_SCENARIO
                    ),
                    true,
                    MainToolbarButtons.getScenariosIcon()
                ),
                this.makeToolbarButton(
                    "Get Code",
                    () => this.getCode(),
                    true,
                    MainToolbarButtons.getGetCodeIcon()
                ),
                this.makeToolbarButton(
                    "Get JSON",
                    () => this.getModelAsJson(),
                    true,
                    MainToolbarButtons.getGetJsonIcon()
                ),
                this.makeToolbarButton(
                    "Interpret",
                    () => this.props.goToSemanticSelect(),
                    true,
                    MainToolbarButtons.getSemanticSelectIcon()
                ),
                this.makeToolbarButton(
                    "Publish",
                    () => this.props.setOpenModalBox(ModalBoxType.EXPORT_MODEL),
                    true,
                    MainToolbarButtons.getPublishModelIcon()
                ),
                this.makeToolbarButton(
                    "Import",
                    () => this.props.setOpenModalBox(ModalBoxType.IMPORT_MODEL),
                    true,
                    MainToolbarButtons.getImportModelIcon()
                ),
                this.makeToolbarButton(
                    "Help",
                    () => this.props.setOpenModalBox(ModalBoxType.HELP),
                    true,
                    MainToolbarButtons.getHelpIcon()
                ),
                this.makeToolbarButton(
                    "Back",
                    () => this.props.exitCanvasScreen(),
                    true,
                    MainToolbarButtons.getGoBackIcon()
                ),
            ]);
    }


    private downloadData(blob: Blob, fileName: string): void {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    private getCode(): void {
        this.props.restClient.getCode(
            this.props.sessionId,
            (code: string) => this.downloadData(new Blob([code]), "Model.jl")
        );
    }

    private getModelAsJson(): void {
        this.props.firebaseDataModel.getDataForSession(
            this.props.sessionId,
            (data: any) => this.downloadData(
                new Blob([JSON.stringify(data)]),
                `${this.props.sessionId}.json`
            )
        );
    }

    public static getHelpIcon(): ReactElement {
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

    public static getSemanticSelectIcon(): ReactElement {
        return (<PlayArrowIcon />);
    }

    public static getPublishModelIcon(): ReactElement {
        return (<PublishIcon />);
    }

    public static getIconForMode(mode: UiMode): ReactElement {
        switch (mode) {
            case UiMode.CONNECT:
                return (<NorthEastIcon />);
            case UiMode.DYN_VARIABLE:
                return (<AddCircleIcon />);
            case UiMode.SUM_VARIABLE:
                return (<AddCircleOutlineIcon />);
            case UiMode.EDIT:
                return (<EditIcon />);
            case UiMode.FLOW:
                return (<EastIcon />);
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
