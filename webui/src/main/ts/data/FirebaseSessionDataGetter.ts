import { LoadedStaticModel } from "../view/Screens/StockFlowScreen";
import FirebaseComponent from "./components/FirebaseComponent";
import FirebaseScenario from "./components/FirebaseScenario";
import FirebaseSubstitution from "./components/FirebaseSubstitution";
import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseSessionDataGetter {

    private readonly firebaseDataModel: FirebaseDataModel;

    public constructor(firebaseDataModel: FirebaseDataModel) {
        this.firebaseDataModel = firebaseDataModel;
    }

    public loadCausalLoopModel(
        modelUuid: string,
        onNameUpdated: (name: string) => void,
        onComponentsUpdated: (cpts: FirebaseComponent[]) => void,
    ): () => void {
        // setup callbacks
        const unsubCpts = this.firebaseDataModel.subscribeToSessionComponents(
            modelUuid,
            onComponentsUpdated
        );
        const unsubName = this.firebaseDataModel.subscribeToSessionModelName(
            modelUuid,
            onNameUpdated
        );

        return () => {
            unsubCpts();
            unsubName();
        };
    }

    public loadStockFlowModel(
        modelUuid: string,
        onNameUpdated: (name: string) => void,
        onComponentsUpdated: (cpts: FirebaseComponent[]) => void,
        onLoadedModelsUpdated: (models: LoadedStaticModel[]) => void,
        onScenariosUpdated: (scenarios: FirebaseScenario[]) => void,
        onSubstitutionsUpdated: (subs: FirebaseSubstitution[]) => void,
    ): () => void {
        // A stock flow model is treated the same in the DB as
        // a CLD but with sub-models and scenarios
        const unsubOtherComponents = this.loadCausalLoopModel(
            modelUuid,
            onNameUpdated,
            onComponentsUpdated,
        );
        const unsubLoadedModels = this.firebaseDataModel
            .subscribeToSessionModels(
                modelUuid,
                onLoadedModelsUpdated
            );
        const unsubScenarios = this.firebaseDataModel
            .subscribeToSessionScenarios(
                modelUuid,
                onScenariosUpdated
            );
        const unsubSubstitutions = this.firebaseDataModel
            .subscribeToSessionSubstitutions(
                modelUuid,
                onSubstitutionsUpdated
            );

        return () => {
            unsubLoadedModels();
            unsubScenarios();
            unsubOtherComponents();
            unsubSubstitutions();
        };
    }
}
