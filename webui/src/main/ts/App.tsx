import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FirebaseManager from "./FirebaseManager";
import LoginScreen from "./components/screens/LoginScreen";
import SimulationScreen from "./components/screens/SimulationScreen";

const firebaseManager = new FirebaseManager();

function App() {
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
    console.log("register authcallback")
    firebaseManager.registerAuthChangedCallback(
        b => {
            setIsSignedIn(b);
            console.log("authcallback " + b)
        }
    );

    if (!isSignedIn) {
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
