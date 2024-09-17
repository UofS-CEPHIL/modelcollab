import { LoadedStaticModel } from "../view/screens/canvas/stockflow/StockFlowScreen"
import FirebaseComponent from "./components/FirebaseComponent"
import FirebaseModel, { ComponentSchema } from "./components/FirebaseModel"
import FirebasePropertyOverrides from "./components/FirebasePropertyOverrides"
import FirebaseScenario, { ScenarioComponentData } from "./components/FirebaseScenario"
import FirebaseSubstitution from "./components/FirebaseSubstitution"


export interface StockFlowSchema extends ComponentSchema {
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
        [id: string]: ScenarioComponentData
    },
    substitutions: {
        [replacedId: string]: string
    },
    overrides: FirebasePropertyOverrides,
}

export default class FirebaseStockFlowModel
    extends FirebaseModel<StockFlowSchema>
{

    public static arrangeModelData(
        components: FirebaseComponent[],
        scenarios: FirebaseScenario[],
        substitutions: FirebaseSubstitution[],
        overrides: FirebasePropertyOverrides,
        loadedModels: LoadedStaticModel[]
    ): StockFlowSchema {
        return {
            components: Object.fromEntries(
                components.map(c => c.toFirebaseEntry())
            ),
            scenarios: Object.fromEntries(
                scenarios.map(c => c.toFirebaseEntry())
            ),
            substitutions: Object.fromEntries(
                substitutions.map(c => [c.replacedId, c.replacementId])
            ),
            loadedModels: Object.fromEntries(
                loadedModels.map(m => [
                    m.modelId,
                    Object.fromEntries(
                        m.components.map(c => c.toFirebaseEntry())
                    ),
                ])
            ),
            overrides
        }
    }

    public empty(uuid: string) {
        this.uuid = uuid;
        this.data = {
            components: {},
            loadedModels: {},
            scenarios: {},
            substitutions: {},
            overrides: {},
        };
    }
}
