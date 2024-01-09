import { LoadedStaticModel } from "../view/Screens/StockFlowScreen";
import FirebaseComponent from "./components/FirebaseComponent";
import FirebaseScenario from "./components/FirebaseScenario";
import FirebaseDataModel from "./FirebaseDataModel";

export default class FirebaseSessionDataGetter {

    private readonly firebaseDataModel: FirebaseDataModel;

    public constructor(firebaseDataModel: FirebaseDataModel) {
        this.firebaseDataModel = firebaseDataModel;
    }

    public loadModel(
        modelUuid: string,
        onNameUpdated: (name: string) => void,
        onComponentsUpdated: (cpts: FirebaseComponent[]) => void,
        onLoadedModelsUpdated: (models: LoadedStaticModel[]) => void,
        onScenariosUpdated: (scenarios: FirebaseScenario[]) => void,
        onModelLoaded?: () => void
    ): () => void {
        // Check if model UUID exists in RTDB. Load it if not.
        this.firebaseDataModel.getDataForSession(
            modelUuid,
            data => {
                if (!data.exists)
                    this.firebaseDataModel
                        .loadModelIntoRTDB(modelUuid)
                        .then(_ => this.firebaseDataModel
                            .declareIsUsingSession(modelUuid)
                        )
                        .then(onModelLoaded);
                else {
                    this.firebaseDataModel.declareIsUsingSession(modelUuid);
                    if (onModelLoaded) onModelLoaded();
                }
            }
        );

        // setup callbacks
        const unsubCpts = this.firebaseDataModel.subscribeToSessionComponents(
            modelUuid,
            onComponentsUpdated
        );
        const unsubName = this.firebaseDataModel.subscribeToSessionModelName(
            modelUuid,
            onNameUpdated
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

        return () => {
            unsubCpts();
            unsubName();
            unsubLoadedModels();
            unsubScenarios();
            this.firebaseDataModel.declareStoppedUsingSession(modelUuid);
        };
    }
}
