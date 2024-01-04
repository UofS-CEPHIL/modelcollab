import React, { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginScreen from "./view/Screens/LoginScreen";
import StockFlowScreen from "./view/Screens/StockFlowScreen";
import FirebaseManager from "./data/FirebaseManager";
import FirebaseDataModel from "./data/FirebaseDataModel";
import RestClient from "./rest/RestClient";
import { ThemeProvider } from "@emotion/react";
import { theme } from "./Themes";

interface Props {

}

interface State {
    isSignedIn: boolean;
    currentSession: string | null;
}

export default class App extends React.Component<Props, State> {

    private firebaseDataModel: FirebaseDataModel;
    private firebaseManager: FirebaseManager;
    private restClient: RestClient;

    public constructor(props: Props) {
        super(props);
        this.state = { isSignedIn: false, currentSession: null };
        this.restClient = new RestClient();
        this.firebaseManager = new FirebaseManager();
        this.firebaseDataModel = new FirebaseDataModel(this.firebaseManager);
    }

    public componentDidMount(): void {
        this.firebaseManager.registerAuthChangedCallback(
            isSignedIn => this.setState({ isSignedIn })
        );
    }

    public render(): ReactElement {
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
                    </Routes>
                </Router>
            );
        }
        else {
            return (
                <ThemeProvider theme={theme}>
                    <Router>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <StockFlowScreen
                                        firebaseDataModel={this.firebaseDataModel}
                                        restClient={this.restClient}
                                        logOut={
                                            () => this.firebaseManager.logOut()
                                        }
                                        sessionId={"NULL"}
                                    />
                                }
                            />
                        </Routes>
                    </Router>
                </ThemeProvider>
            );
        }
    }
}
