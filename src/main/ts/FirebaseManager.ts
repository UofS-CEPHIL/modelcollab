import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { getDatabase, Database, connectDatabaseEmulator } from "firebase/database";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";

import firebaseConfig from "./config/firebaseConfig";
import applicationConfig from "./config/applicationConfig";

// TODO this should be split into 2 classes for production and dev
export default class FirebaseManager {

    // DB needs to be `any` because of strange type incompatibility
    // b/w @firebase/rules-unit-testing and actual firebase - firebase/dabase.
    // This should be a Database type from either of those packages.
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
            connectDatabaseEmulator(theManager.db, "localhost", 9000);
        }
        return theManager;
    }

    public getDb(): Database {
        if (this.db) return this.db;
        else throw new Error("Database not configured.");
    }

    public registerAuthChangedCallback(callback: (isSignedIn: boolean) => void) {
        if (this.isProduction()) {
            if (!this.auth)
                throw new Error("Auth not configured.");
            onAuthStateChanged(
                this.auth,
                user => callback(user != null)
            );

        }
        this.authStateChangedCallback = callback;
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
            if (!this.testEnvironment) throw new Error("Test environment not configured.");
            const authContext = this.testEnvironment.authenticatedContext("owner");
            this.db = authContext.database(firebaseConfig.databaseURL);
            if (!this.db) throw new Error("Error creating database");
            if (this.authStateChangedCallback) this.authStateChangedCallback(true);
        }
    }

    private isProduction(): boolean {
        return this.testEnvironment === null;
    }

}
