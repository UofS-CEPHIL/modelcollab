import { Database } from "firebase/database";

export default interface FirebaseManager {
    login: () => void;
    registerAuthChangedCallback: (callback: (isSignedIn: boolean) => void) => void;
    getDb: () => Database;
}
