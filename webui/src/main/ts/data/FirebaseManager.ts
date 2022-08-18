import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup } from "firebase/auth";
import { connectDatabaseEmulator, Database, getDatabase } from "firebase/database";

import firebaseConfig from "../config/firebaseConfig";


export default class FirebaseManager {

    private db: Database;
    private auth: Auth;
    private app: FirebaseApp;
    private authChangedCallback: ((isSignedIn: boolean) => void) | null;

    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getDatabase(this.app);
        this.authChangedCallback = null;
    }

    public getDb(): Database {
        if (this.db) return this.db;
        else throw new Error("Database not configured.");
    }

    public registerAuthChangedCallback(callback: (isSignedIn: boolean) => void) {
        if (!this.auth) throw new Error("Auth not configured.");
        if (!firebaseConfig.useEmulators) {
            onAuthStateChanged(
                this.auth,
                user => callback(user != null)
            );
        }
        this.authChangedCallback = callback;
    }

    public login(): void {
        if (firebaseConfig.useEmulators) {
            console.log("connecting firebase emulator");
            connectDatabaseEmulator(
                this.db,
                "localhost",
                9000
            );
            if (this.authChangedCallback) {
                this.authChangedCallback(true);
            }
        }
        else {
            console.log("connecting to firebase cloud");
            const provider = new GoogleAuthProvider();
            signInWithPopup(this.auth, provider)
                .then(() => {
                    console.log("Successfully logged in!");
                })
                .catch((error) => {
                    console.error("Error signing in: ", error);
                });
        }
    }
}
