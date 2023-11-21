import React, { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginScreen from "./components/Screens/LoginScreen";
import CanvasScreen from "./components/maxgraph/CanvasScreen";
import FirebaseManagerImpl from "./data/FirebaseManagerImpl";
import FirebaseDataModelImpl from "./data/FirebaseDataModelImpl";
import FirebaseManager from "./data/FirebaseManager";
import FirebaseDataModel from "./data/FirebaseDataModel";
import RestClientImpl from "./rest/RestClientImpl";
import RestClient from "./rest/RestClient";

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

    constructor(props: Props) {
        super(props);
        this.state = { isSignedIn: false, currentSession: null };
        this.restClient = new RestClientImpl();
        this.firebaseManager = new FirebaseManagerImpl();
        this.firebaseDataModel = new FirebaseDataModelImpl(this.firebaseManager);

        this.firebaseManager.registerAuthChangedCallback(
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
        // else if (!this.state.currentSession) {
        //     return (<Router>
        //         <Routes>
        //             <Route
        //                 path="/"
        //                 element={<SessionSelectScreen
        //                     firebaseData={new FirebaseDataModelImpl(firebaseManager)}
        //                     openSession={s => this.setState({ ...this.state, currentSession: s })}
        //                 />}
        //             />
        //         </Routes>
        //     </Router>
        //     );
        // }
        else {
            return (
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <CanvasScreen
                                    firebaseDataModel={this.firebaseDataModel}
                                    restClient={this.restClient}
                                    returnToSessionSelect={
                                        () => console.error("Not implemented")
                                    }
                                    sessionId={"NULL"}
                                />
                            }
                        />
                    </Routes>
                </Router>
            );
        }
    }
}
