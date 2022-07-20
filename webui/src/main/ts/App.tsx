import React, { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FirebaseManager from "./data/FirebaseManager";
import LoginScreen from "./components/screens/LoginScreen";
import SimulationScreen from "./components/screens/SimulationScreen";
import IdGenerator from "./IdGenerator";

const firebaseManager = new FirebaseManager();

interface Props {

}

interface State {
    isSignedIn: boolean
}

export default class App extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { isSignedIn: false };

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
        else {
            return (
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <SimulationScreen
                                    firebaseManager={firebaseManager}
                                    sessionId={IdGenerator.generateSessionId()}
                                />
                            }
                        />
                    </Routes>
                </Router>
            );
        }
    }
}
