import { LoadedStaticModel } from "../view/Screens/StockFlowScreen";
import FirebaseComponent from "./components/FirebaseComponent";
import FirebaseScenario from "./components/FirebaseScenario";

export default class FirestoreSchema {

    static makeUserPath(uid: string): string {
        return `/users/${uid}`;
    }

    static makeModelPath(uuid: string): string {
        return `/models/${uuid}`;
    }

    static arrangeModelData(
        components: FirebaseComponent[],
        scenarios: FirebaseScenario[],
        loadedModels: LoadedStaticModel[]
    ): Object {
        return {
            "components": Object.fromEntries(
                components.map(c => c.toFirebaseEntry())
            ),
            "scenarios": Object.fromEntries(
                scenarios.map(c => c.toFirebaseEntry())
            ),
            "loadedModels": [] // TODO
        }
    }

    static makeUserOwnedModelPath(uid: string, modelUuid: string): string {
        return `${this.makeUserOwnedModelsPath(uid)}/${modelUuid}`
    }

    static makeUserOwnedModelsPath(uid: string): string {
        return `${this.makeUserPath(uid)}/ownedModels`;
    }

}
