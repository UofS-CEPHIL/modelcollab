import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, connectAuthEmulator, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { connectDatabaseEmulator, Database, getDatabase } from "firebase/database";
import firebaseConfig from "../config/firebaseConfig";


export default class FirebaseManager {
    private db: Database;
    private auth: Auth;
    private app: FirebaseApp;
    private user: User | null;

    constructor() {
        this.app = initializeApp(firebaseConfig);
        this.auth = getAuth(this.app);
        this.db = getDatabase(this.app);
        this.user = null;

        if (firebaseConfig.useEmulators) {
            connectAuthEmulator(
                this.auth,
                "http://localhost:9099"
            );
            connectDatabaseEmulator(
                this.db,
                "localhost",
                9000
            );
        }
    }

    public getDb(): Database {
        return this.db;
    }

    public registerAuthChangedCallback(callback: (isSignedIn: boolean) => void) {
        onAuthStateChanged(
            this.auth,
            user => {
                this.user = user;
                callback(user != null);
            }
        );
    }

    public getUser(): User | null {
        return this.user;
    }

    public login(): void {
        const provider = new GoogleAuthProvider();
        signInWithPopup(this.auth, provider)
            .then(() => console.log("Successfully signed in!"))
            .catch(e => console.error("Error signing in: ", e));
    }

    public logOut(): void {
        signOut(this.auth);
    }
}
