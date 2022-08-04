import React, { ReactElement } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FirebaseManager from "./data/FirebaseManager";
import LoginScreen from "./components/screens/LoginScreen";
import SimulationScreen from "./components/screens/SimulationScreen";
import SessionSelectScreen from "./components/screens/SessionSelectScreen";
import FirebaseDataModelImpl from "./data/FirebaseDataModelImpl";

const firebaseManager = new FirebaseManager();

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
                                    firebaseManager={firebaseManager}
                                    sessionId={this.state.currentSession}
                                    returnToSessionSelect={() => this.setState({ ...this.state, currentSession: null })}
                                />
                            }
                        />
                    </Routes>
                </Router>
            );
        }
    }
}
