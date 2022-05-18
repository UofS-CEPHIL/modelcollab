import { useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginScreen from "./components/screens/LoginScreen";
import SimulationScreen from "./components/screens/SimulationScreen";
import firebaseApp from "./firebase";

function App() {
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
    let user: User | null = null;

    onAuthStateChanged(
        getAuth(firebaseApp),
        (user) => {
            if (user) {
                setIsSignedIn(true);
                user = user;
            }
            else {
                setIsSignedIn(false);
                user = null;
            }
        });

    if (!isSignedIn) return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginScreen />} />
            </Routes>
        </Router>
    );
    else return (
        <Router>
            <Routes>
                <Route path="/" element={<SimulationScreen user={user} />} />
            </Routes>
        </Router>
    );
}

export default App;
