import { FirebaseComponentModel, FirebaseSchema } from "database/build/export";
import { initializeApp } from "firebase/app";
import { connectDatabaseEmulator, Database, getDatabase, ref, get } from "firebase/database";
import firebaseConfig from "../config/FirebaseConfig";

export interface ComponentsResult {
    topLevelComponents: FirebaseComponentModel.FirebaseDataComponent<any>[];
    staticComponents: { [id: string]: FirebaseComponentModel.FirebaseDataComponent<any>[] }
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

        function getComponents(fbResult: any, idPrefix?: string): FirebaseComponentModel.FirebaseDataComponent<any>[] {
            if (!fbResult.exists()) {
                return [];
            }
            if (!idPrefix) {
                idPrefix = '';
            }
            const data = fbResult.val();
            return Object.keys(data).map(
                k => FirebaseComponentModel.createFirebaseDataComponent(k, data[k], idPrefix)
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
            c => c.getType() === FirebaseComponentModel.ComponentType.STATIC_MODEL
        );
        let staticComponents: { [id: string]: FirebaseComponentModel.FirebaseDataComponent<any>[] } = {};
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
