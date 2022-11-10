import React, { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { FirebaseComponentModel as schema } from "database/build/export";

import LoginScreen from "./components/Screens/LoginScreen";
import CanvasScreen from "./components/Screens/CanvasScreen";
import SessionSelectScreen from "./components/Screens/SessionSelectScreen";
import FirebaseDataModelImpl from "./data/FirebaseDataModelImpl";
import FirebaseManagerImpl from "./data/FirebaseManagerImpl";
import { UiMode } from "./UiMode";
import MoveModeCanvas from "./components/Canvas/ModeCanvas/MoveModeCanvas";
import { Props as CanvasProps } from "./components/Canvas/BaseCanvas";
import StockModeCanvas from "./components/Canvas/ModeCanvas/StockModeCanvas";
import FlowModeCanvas from "./components/Canvas/ModeCanvas/FlowModeCanvas";
import DeleteModeCanvas from "./components/Canvas/ModeCanvas/DeleteModeCanvas";
import EditModeCanvas from "./components/Canvas/ModeCanvas/EditModeCanvas";
import ParamModeCanvas from "./components/Canvas/ModeCanvas/ParamModeCanvas";
import SumVariableModeCanvas from "./components/Canvas/ModeCanvas/SumVariableModeCanvas";
import ConnectModeCanvas from "./components/Canvas/ModeCanvas/ConnectModeCanvas";
import DynamicVariableModeCanvas from "./components/Canvas/ModeCanvas/DynamicVariableModeCanvas";
import CloudModeCanvas from "./components/Canvas/ModeCanvas/CloudModeCanvas";
import { Props as EditBoxProps } from './components/EditBox/EditBox';
import { Props as ScenarioEditBoxProps } from './components/EditBox/ScenarioEditBox';
import CanvasScreenToolbar, { Props as ToolbarProps } from './components/Toolbar/CanvasScreenToolbar';
import ImportModelBox, { Props as ImportModelBoxProps } from './components/ImportModelBox/ImportModelBox';
import SaveModelBox, { Props as SaveModelBoxProps } from "./components/SaveModelBox/SaveModelBox";
import ComponentRendererImpl from "./components/Canvas/Renderer/ComponentRendererImpl";
import IdentifyModeCanvas from "./components/Canvas/ModeCanvas/IdentifyModeCanvas";
import StockEditBox from "./components/EditBox/StockEditBox";
import FlowEditBox from "./components/EditBox/FlowEditBox";
import ParameterEditBox from "./components/EditBox/ParameterEditBox";
import VariableEditBox from "./components/EditBox/DynamicVariableEditBox";
import ScenarioEditBox from "./components/EditBox/ScenarioEditBox";
import SumVariableEditBox from "./components/EditBox/SumVariableEditBox";

const firebaseManager = new FirebaseManagerImpl();

interface Props {

}

interface State {
    isSignedIn: boolean;
    currentSession: string | null;
}

export default class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { isSignedIn: false, currentSession: null };

        firebaseManager.registerAuthChangedCallback(
            isSignedIn => this.setState({ isSignedIn })
        );
    }

    render(): ReactElement {
        if (!this.state.isSignedIn) {
            return (
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={<LoginScreen firebaseManager={firebaseManager} />}
                        />
                    </Routes>
                </Router>
            );
        }
        else if (!this.state.currentSession) {
            return (<Router>
                <Routes>
                    <Route
                        path="/"
                        element={<SessionSelectScreen
                            firebaseData={new FirebaseDataModelImpl(firebaseManager)}
                            openSession={s => this.setState({ ...this.state, currentSession: s })}
                        />}
                    />
                </Routes>
            </Router>
            );
        }
        else {
            return (
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <CanvasScreen
                                    firebaseDataModel={new FirebaseDataModelImpl(firebaseManager)}
                                    sessionId={this.state.currentSession}
                                    returnToSessionSelect={() => this.setState({ ...this.state, currentSession: null })}
                                    createCanvasForMode={(m, p) => this.createCanvasForMode(m, p)}
                                    createEditBox={p => this.createEditBox(p)}
                                    createToolbar={p => this.createToolbar(p)}
                                    createImportModelBox={p => this.createImportModelBox(p)}
                                    createSaveModelBox={p => this.createSaveModelBox(p)}
                                    renderer={new ComponentRendererImpl()}
                                />
                            }
                        />
                    </Routes>
                </Router>
            );
        }
    }

    private createEditBox(props: EditBoxProps<any>): ReactElement {
        switch (props.initialComponent.getType()) {
            case schema.ComponentType.STOCK:
                return (
                    <StockEditBox {...props} />
                );
            case schema.ComponentType.FLOW:
                return (
                    <FlowEditBox{...props} />
                );
            case schema.ComponentType.PARAMETER:
                return (
                    <ParameterEditBox {...props} />
                );
            case schema.ComponentType.VARIABLE:
                return (
                    <VariableEditBox {...props} />
                );
            case schema.ComponentType.SUM_VARIABLE:
                return (
                    <SumVariableEditBox {...props} />
                );
            case schema.ComponentType.SCENARIO:
                return (
                    <ScenarioEditBox {...props as ScenarioEditBoxProps} />
                );
            default:
                throw new Error(
                    "Attempted to create edit box for invalid component: " + props.initialComponent
                );
        }

    }

    private createImportModelBox(props: ImportModelBoxProps): ReactElement {
        return (
            <ImportModelBox {...props} />
        );
    }

    private createSaveModelBox(props: SaveModelBoxProps): ReactElement {
        return (
            <SaveModelBox {...props} />
        );
    }

    private createToolbar(props: ToolbarProps): ReactElement {
        return (
            <CanvasScreenToolbar {...props} />
        );
    }

    private createCanvasForMode(mode: UiMode, props: CanvasProps): ReactElement {
        switch (mode) {
            case UiMode.MOVE:
                return (
                    <MoveModeCanvas
                        {...props}
                    />
                );
            case UiMode.STOCK:
                return (
                    <StockModeCanvas
                        {...props}
                    />
                );
            case UiMode.FLOW:
                return (
                    <FlowModeCanvas
                        {...props}
                    />
                );
            case UiMode.DELETE:
                return (
                    <DeleteModeCanvas
                        {...props}
                    />
                );
            case UiMode.EDIT:
                return (
                    <EditModeCanvas
                        {...props}
                    />
                );
            case UiMode.PARAM:
                return (
                    <ParamModeCanvas
                        {...props}
                    />
                );
            case UiMode.SUM_VARIABLE:
                return (
                    <SumVariableModeCanvas
                        {...props}
                    />
                );
            case UiMode.CONNECT:
                return (
                    <ConnectModeCanvas
                        {...props}
                        showConnectionHandles={true}
                    />
                );
            case UiMode.DYN_VARIABLE:
                return (
                    <DynamicVariableModeCanvas
                        {...props}
                    />
                );
            case UiMode.CLOUD:
                return (
                    <CloudModeCanvas
                        {...props}
                    />
                );
            case UiMode.IDENTIFY:
                return (
                    <IdentifyModeCanvas
                        {...props}
                    />
                );

        }
    }

}
