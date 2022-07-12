import { FirebaseDataComponent } from "database/build/data/FirebaseComponentModel";
import { FirebaseComponentModel, FirebaseSchema } from "database/build/export";
import { initializeApp } from "firebase/app";
import { connectDatabaseEmulator, Database, getDatabase, ref, get } from "firebase/database";
import firebaseConfig from "../FirebaseConfig";


export class FirebaseClient {

    private db: Database;

    constructor() {
        const app = initializeApp(firebaseConfig);
        this.db = getDatabase(app);
        if (firebaseConfig.useEmulators) {
            connectDatabaseEmulator(
                this.db,
                firebaseConfig.emulatorHost,
                firebaseConfig.emulatorPort
            );
        }
    }

    async getComponents(sessionId: string): Promise<FirebaseDataComponent[]> {
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
            k => FirebaseComponentModel.createFirebaseDataComponent(k, data[k])
        );
    }

}
