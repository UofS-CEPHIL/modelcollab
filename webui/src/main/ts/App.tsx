import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FirebaseManager from "database/build/FirebaseManager";

import LoginScreen from "./components/screens/LoginScreen";
import SimulationScreen from "./components/screens/SimulationScreen";

function App() {
    const [firebaseManager, setFirebaseManager] = useState<FirebaseManager | null>(null);
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

    useEffect(() => {
        FirebaseManager.create().then((mgr: FirebaseManager) => {
            setFirebaseManager(mgr);
            mgr.registerAuthChangedCallback(setIsSignedIn);
        });
    }, []);

    if (!firebaseManager) {
        return (
            <div />
        );
    }
    else if (!isSignedIn) {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<LoginScreen firebaseManager={firebaseManager} />} />
                </Routes>
            </Router>
        );
    }
    else {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<SimulationScreen firebaseManager={firebaseManager} />} />
                </Routes>
            </Router>
        );
    }
}

export default App;
