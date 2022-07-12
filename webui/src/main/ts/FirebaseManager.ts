import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { connectDatabaseEmulator, Database, getDatabase } from "firebase/database";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";

import firebaseConfig from "./config/firebaseConfig";
import applicationConfig from "./config/applicationConfig";

export default class FirebaseManager {

    private db: any | null;
    private auth: Auth | null;
    private app: FirebaseApp | null;
    private testEnvironment: RulesTestEnvironment | null;
    private authStateChangedCallback: ((isSignedIn: boolean) => void) | null;

    private constructor() {
        this.db = null;
        this.auth = null;
        this.app = null;
        this.testEnvironment = null;
        this.authStateChangedCallback = null;
    }

    public static async create(): Promise<FirebaseManager> {
        const theManager = new FirebaseManager();
        if (applicationConfig.isProduction) {
            theManager.testEnvironment = null;
            theManager.app = initializeApp(firebaseConfig);
            theManager.auth = getAuth(theManager.app);
            theManager.db = getDatabase(theManager.app);
        }
        else {
            theManager.app = null;
            theManager.auth = null;
            theManager.testEnvironment = await initializeTestEnvironment({
                projectId: "modelcollab",
                database: {
                    host: "localhost",
                    port: 9000
                }
            });
            theManager.db = theManager
                .testEnvironment
                .unauthenticatedContext()
                .database(firebaseConfig.databaseURL);
        }
        return theManager;
    }

    public getDb(): Database {
        if (this.db) return this.db;
        else throw new Error("Database not configured.");
    }

    public registerAuthChangedCallback(callback: (isSignedIn: boolean) => void) {
        this.authStateChangedCallback = callback;
        if (this.isProduction()) {
            if (!this.auth) throw new Error("Auth not configured.");
            onAuthStateChanged(
                this.auth,
                user => callback(user != null)
            );
        }
    }

    public login(): void {
        if (this.isProduction()) {
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
            if (!this.authStateChangedCallback) throw new Error("No auth callback configured.");
            if (!this.testEnvironment) throw new Error("Test environment not configured.");
            const authContext = this.testEnvironment.authenticatedContext("owner");
            this.db = authContext.database(firebaseConfig.databaseURL);
            if (!this.db) throw new Error("Error creating database");
            this.authStateChangedCallback(true);
        }
    }

    private isProduction(): boolean {
        return this.testEnvironment === null;
    }

}
