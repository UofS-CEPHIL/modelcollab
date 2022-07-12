import {
    FirebaseApp,
    initializeApp
} from "firebase/app";
import {
    Auth,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithPopup,
} from "firebase/auth";
import {
    connectDatabaseEmulator,
    Database,
    getDatabase
} from "firebase/database";

import firebaseConfig from "./FirebaseConfig";

export default class FirebaseManager {

    private db: Database;
    private auth: Auth;
    private app: FirebaseApp;
    private authStateChangedCallback: ((isSignedIn: boolean) => void) | null;

    private constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getDatabase(this.app);
        this.authStateChangedCallback = null;
    }

    public static async create(): Promise<FirebaseManager> {
        const theManager = new FirebaseManager();
        return theManager;
    }

    public getDb(): Database {
        if (this.db) return this.db;
        else throw new Error("Database not configured.");
    }

    public registerAuthChangedCallback(callback: (isSignedIn: boolean) => void) {
        this.authStateChangedCallback = callback;
        if (!this.auth) throw new Error("Auth not configured.");
        onAuthStateChanged(
            this.auth,
            user => callback(user != null)
        );
    }

    public login(): void {
        if (!firebaseConfig.useEmulators) {
            if (!this.auth) throw new Error("Auth not configured.");
            const provider = new GoogleAuthProvider();
            signInWithPopup(this.auth, provider)
                .then(() => {
                    console.log("Successfully logged in!");
                })
                .catch((error) => {
                    console.error("Error signing in: ", error);
                });
        }
        else {
            connectDatabaseEmulator(this.db, "127.0.0.1", 9000);
            if (this.authStateChangedCallback)
                this.authStateChangedCallback(true);
        }
    }
}
