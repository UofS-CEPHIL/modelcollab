import ComponentType from "database/build/ComponentType";
import FirebaseDataComponent from "database/build/FirebaseDataComponent";
import FirebaseSchema from "database/build/FirebaseSchema";
import { initializeApp } from "firebase/app";
import { connectDatabaseEmulator, Database, getDatabase, ref, get } from "firebase/database";
import firebaseConfig from "../config/FirebaseConfig";

export interface ComponentsResult {
    topLevelComponents: FirebaseDataComponent<any>[];
    staticComponents: { [id: string]: FirebaseDataComponent<any>[] }
}

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

    async getComponents(sessionId: string): Promise<ComponentsResult> {

        function getComponents(fbResult: any, idPrefix?: string): FirebaseDataComponent<any>[] {
            if (!fbResult.exists()) {
                return [];
            }
            if (!idPrefix) {
                idPrefix = '';
            }
            const data = fbResult.val();
            return Object.keys(data).map(
                k => FirebaseDataComponent.createFirebaseDataComponent(k, data[k], idPrefix)
            );
        }

        const topLevelResult = await get(
            ref(
                this.db,
                FirebaseSchema.makeAllComponentsForSessionPath(sessionId)
            )
        );
        const topLevelComponents = getComponents(topLevelResult);

        const staticModels = topLevelComponents.filter(
            c => c.getType() === ComponentType.STATIC_MODEL
        );
        let staticComponents: { [id: string]: FirebaseDataComponent<any>[] } = {};
        for (let i = 0; i < staticModels.length; i++) {
            const sm = staticModels[i];
            const fbResult = await get(
                ref(
                    this.db,
                    FirebaseSchema.makeSavedModelPath(sm.getData().modelId)
                )
            );
            if (fbResult.exists()) {
                const components = getComponents(fbResult, sm.getId() + "/");
                staticComponents[sm.getData().modelId] = components;
            }
        }
        return { topLevelComponents, staticComponents };
    }
}
