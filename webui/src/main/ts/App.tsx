import React, { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import LoginScreen from "./view/Screens/LoginScreen";
import StockFlowScreen from "./view/Screens/StockFlowScreen";
import FirebaseManager from "./data/FirebaseManager";
import FirebaseDataModel from "./data/FirebaseDataModel";
import RestClient from "./rest/RestClient";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./Themes";
import ModelSelectScreen from "./view/Screens/ModelSelectScreen";

interface Props {

}

interface State {
    isSignedIn: boolean;
}

export default class App extends React.Component<Props, State> {

    private firebaseDataModel: FirebaseDataModel;
    private firebaseManager: FirebaseManager;
    private restClient: RestClient;

    public constructor(props: Props) {
        super(props);
        this.state = {
            isSignedIn: false,
        };
        this.restClient = new RestClient();
        this.firebaseManager = new FirebaseManager();
        this.firebaseDataModel = new FirebaseDataModel(this.firebaseManager);
    }

    public componentDidMount(): void {
        this.firebaseManager.registerAuthChangedCallback(
            isSignedIn => this.setState({ isSignedIn })
        );
        document.title = "ModelCollab";
    }

    public render(): ReactElement {
        return (
            <ThemeProvider theme={theme}>
                {this.getRoutes()}
            </ThemeProvider>
        );
    }

    private getRoutes(): ReactElement {
        if (!this.state.isSignedIn) {
            return (
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <LoginScreen
                                    firebaseManager={this.firebaseManager}
                                />
                            }
                        />
                        <Route
                            path="*"
                            element={
                                <Navigate to="/" />
                            }
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
                                <ModelSelectScreen
                                    firebaseDataModel={this.firebaseDataModel}
                                />
                            }
                        />
                        <Route
                            path="/:uuid"
                            element={
                                <StockFlowScreen
                                    firebaseDataModel={this.firebaseDataModel}
                                    restClient={this.restClient}
                                    logOut={() => this.firebaseManager.logOut()}
                                />
                            }
                        />
                    </Routes>
                </Router>
            );
        }
    }
}
