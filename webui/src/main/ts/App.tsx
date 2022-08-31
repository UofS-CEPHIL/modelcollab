import React, { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginScreen from "./components/screens/LoginScreen";
import SimulationScreen from "./components/screens/SimulationScreen";
import SessionSelectScreen from "./components/screens/SessionSelectScreen";
import FirebaseDataModelImpl from "./data/FirebaseDataModelImpl";
import FirebaseManagerImpl from "./data/FirebaseManagerImpl";
import { UiMode } from "./UiMode";
import MoveModeCanvas from "./components/Canvas/MoveModeCanvas";
import { Props as CanvasProps } from "./components/Canvas/BaseCanvas";
import StockModeCanvas from "./components/Canvas/StockModeCanvas";
import FlowModeCanvas from "./components/Canvas/FlowModeCanvas";
import DeleteModeCanvas from "./components/Canvas/DeleteModeCanvas";
import EditModeCanvas from "./components/Canvas/EditModeCanvas";
import ParamModeCanvas from "./components/Canvas/ParamModeCanvas";
import SumVariableModeCanvas from "./components/Canvas/SumVariableModeCanvas";
import ConnectModeCanvas from "./components/Canvas/ConnectModeCanvas";
import DynamicVariableModeCanvas from "./components/Canvas/DynamicVariableModeCanvas";
import CloudModeCanvas from "./components/Canvas/CloudModeCanvas";
import EditBox, { Props as EditBoxProps } from './components/EditBox/EditBox';
import Toolbar, { Props as ToolbarProps } from './components/Toolbar/Toolbar';

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
                                <SimulationScreen
                                    firebaseDataModel={new FirebaseDataModelImpl(firebaseManager)}
                                    sessionId={this.state.currentSession}
                                    returnToSessionSelect={() => this.setState({ ...this.state, currentSession: null })}
                                    createCanvasForMode={(m, p) => this.createCanvasForMode(m, p)}
                                    createEditBox={(p) => this.createEditBox(p)}
                                    createToolbar={(p) => this.createToolbar(p)}
                                />
                            }
                        />
                    </Routes>
                </Router>
            );
        }
    }

    private createEditBox(props: EditBoxProps): ReactElement {
        return (
            <EditBox {...props} />
        );
    }

    private createToolbar(props: ToolbarProps): ReactElement {
        return (
            <Toolbar {...props} />
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
        }
    }

}
