import { FirebaseComponentModel as schema, FirebaseSchema } from "database/build/export";
import { FirebaseApp, initializeApp } from "firebase/app";
import { connectDatabaseEmulator, Database, getDatabase, ref, get, set, remove, onChildAdded, onChildRemoved, push } from "firebase/database";
import { Auth, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";

import firebaseConfig from "../config/FirebaseConfig";

const TEST_SESSIONS = "test";
export default class FirebaseInteractions {

    private sessionIds: string[];
    private app: FirebaseApp | null
    private db: any | null
    private auth: Auth
    private testEnvironment: RulesTestEnvironment | null
    private authChangedCallback: ((isSignedIn: boolean) => void) | null;

    private readonly SESSION_IDS_PATH = "/sessionIds";

    constructor() {
        this.sessionIds = [TEST_SESSIONS];
        this.testEnvironment = null;

        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getDatabase(this.app);

        this.authChangedCallback = null;
        // this.subscribeToSessionIds();
    }

    private subscribeToSessionIds(): void {
        const sessionsRef = ref(this.getDb(), this.SESSION_IDS_PATH);
        onChildAdded(
            sessionsRef,
            (data: any) => this.sessionIds.push(data.val() as string)
        );
        onChildRemoved(
            sessionsRef,
            (data: any) =>
                this.sessionIds = this.sessionIds.filter((s: string) => s !== (data.val() as string))
        );
    }
    
    public static async create(): Promise<FirebaseInteractions> {
        const theManager = new FirebaseInteractions();
        if (!firebaseConfig.useEmulators) {
            theManager.testEnvironment = null;
            theManager.app = initializeApp(firebaseConfig);
            theManager.auth = getAuth(theManager.app);
            theManager.db = getDatabase(theManager.app);
        }
        else {
            theManager.app = null;
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

            connectDatabaseEmulator(theManager.db, 
                                    firebaseConfig.emulatorHost,
                                    firebaseConfig.emulatorPort);

            // theManager.db = theManager
            // .testEnvironment
            // .unauthenticatedContext()
            // .database();

            // connectDatabaseEmulator(theManager.db, firebaseConfig.emulatorHost,
            //     firebaseConfig.emulatorPort);
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

    async getComponents(sessionId: string): Promise<schema.FirebaseDataComponent<any>[]> {
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

    updateComponent(sessionId: string, data: schema.FirebaseDataComponent<any>) {
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
            if (!this.testEnvironment) throw new Error("Test environment not configured.");
            const authContext = this.testEnvironment.authenticatedContext("owner");
            this.db = authContext.database(firebaseConfig.databaseURL);
            if (!this.db) throw new Error("Error creating database");
            if (this.authChangedCallback) this.authChangedCallback(true);
        }
    }

    // private isProduction(): boolean {
    //     return this.testEnvironment === null;
    // }



    addSession(id: string) {
        const listRef = ref(this.getDb(), "sessionIds/");
        const newRef = push(listRef);
        set(newRef, id);
    }

}





