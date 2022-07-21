import { FirebaseComponentModel as schema, FirebaseSchema } from "database/build/export";
import { FirebaseApp,initializeApp } from "firebase/app";
import { connectDatabaseEmulator, Database, getDatabase, ref, get, set, remove } from "firebase/database";
import { Auth, getAuth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously, signInWithPopup } from "firebase/auth";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";

import firebaseConfig from "../config/FirebaseConfig";
import applicationConfig from "../config/applicationConfig";


export default class FirebaseInteractions {

    private sessionIds: string[];
    private app: FirebaseApp | null
    private db: any | null
    private auth: Auth | null
    private testEnvironment: RulesTestEnvironment | null
    private authStateChangedCallback: ((isSignedIn: boolean) => void) | null;

    constructor() {
        this.sessionIds = []
        this.db = null;
        this.auth = null;
        this.app = null;
        this.testEnvironment = null;
        this.authStateChangedCallback = null;
    }

    public static async create(): Promise<FirebaseInteractions> {
        const theManager = new FirebaseInteractions();
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
                connectDatabaseEmulator(theManager.db, firebaseConfig.emulatorHost,
                firebaseConfig.emulatorPort);
        }
        return theManager;
    }
    

    private makeComponentPath(sessionId: string, componentId: string) {
        return `components/${sessionId}/${componentId}`;
    }

    private getDb(): Database {
        if (this.db) return this.db;
        else throw new Error("Database not configured.");
    }

    async getComponents(sessionId: string): Promise<schema.FirebaseDataComponent[]> {
        const components = await get(
            ref(
                this.db,
                FirebaseSchema.makeAllComponentsForSessionPath(sessionId)
            )
        );
        if (!components.exists()) {
            return [];
        }
        const data = components.val();
        return Object.keys(data).map(
            k => schema.createFirebaseDataComponent(k, data[k])
        );
    }

    removeComponent(sessionId: string, componentId: string) {
        const componentPath = this.makeComponentPath(sessionId, componentId);
        remove(
            ref(
                this.getDb(),
                componentPath
            )
        );
    }

    getSessionIds(): string[] {
        return [...this.sessionIds];
    }

    updateComponent(sessionId: string, data: schema.FirebaseDataComponent) {
        set(
            ref(
                this.getDb(),
                this.makeComponentPath(sessionId, data.getId())
            ),
            {
                type: data.getType().toString(),
                data: data.getData()
            }
        );
    }
    
    public registerAuthChangedCallback(callback: (isSignedIn: boolean) => void) {
        if (!this.auth) throw new Error("Auth not configured.");
        if (!firebaseConfig.useEmulators) {
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

