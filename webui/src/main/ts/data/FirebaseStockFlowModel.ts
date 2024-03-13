import { LoadedStaticModel } from "../view/Screens/StockFlowScreen"
import FirebaseComponent from "./components/FirebaseComponent"
import FirebaseModel, { ComponentSchema, ModelSchema, SharedUsersSchema } from "./components/FirebaseModel"
import FirebaseScenario from "./components/FirebaseScenario"
import { FirebaseSubstitution } from "./components/FirebaseSubstitution"
import { ModelType } from "./FirebaseDataModel"


export interface StockFlowComponentSchema extends ComponentSchema {
    components: {
        [componentId: string]: {
            type: string,
            data: any
        }
    },
    loadedModels: {
        [modelUuid: string]: {
            [componentId: string]: {
                type: string,
                data: any
            }
        }
    }
    scenarios: {
        [name: string]: {
            startTime: string,
            stopTime: string,
            overrides: {
                [paramId: string]: string
            }
        }
    },
    substitutions: {
        [replacedId: string]: string
    }
}

export interface StockFlowSchema extends ModelSchema {
    name: string,
    ownerUid: string,
    modelType: ModelType,
    sharedWith: SharedUsersSchema,
    openRead: boolean,
    openWrite: boolean,
    data: StockFlowComponentSchema
}

type ComponentEntry = [string, { type: string, data: any }];

export default class FirebaseStockFlowModel
    extends FirebaseModel<StockFlowSchema>
{

    public static arrangeModelData(
        components: FirebaseComponent[],
        scenarios: FirebaseScenario[],
        substitutions: FirebaseSubstitution[],
        loadedModels: LoadedStaticModel[]
    ): StockFlowComponentSchema {
        return {
            components: Object.fromEntries(
                components.map(c =>
                    c.toFirebaseEntry() as ComponentEntry
                )
            ),
            scenarios: Object.fromEntries(
                scenarios.map(c => c.toFirebaseEntry())
            ),
            substitutions: Object.fromEntries(
                substitutions.map(c => c.toFirebaseEntry())
            ),
            loadedModels: {} // TODO
        }

    }

    public empty(uuid: string, name: string, ownerUid: string) {
        this.uuid = uuid;
        this.data = {
            name: name,
            ownerUid: ownerUid,
            modelType: ModelType.StockFlow,
            sharedWith: {},
            openRead: false,
            openWrite: false,
            data: {
                components: {},
                loadedModels: {},
                scenarios: {},
                substitutions: {}
            }
        };
    }
}
