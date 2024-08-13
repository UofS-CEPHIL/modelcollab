import { assertSucceeds } from "@firebase/rules-unit-testing";
import { ref, get } from "firebase/database";
import { v4 as uuid } from "uuid";
import FirebaseComponent from "../../../../main/ts/data/components/FirebaseComponent";
import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import RTDBSchema from "../../../../main/ts/data/RTDBSchema";
import { Database } from "./rtdbRules.test";

export async function canReadUserInfo(
    db: Database,
    uid: string
): Promise<void> {
    await canReadUserName(db, uid);
    await canReadUserEmail(db, uid);
}

export async function canReadUserName(
    db: Database,
    uid: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.User.makeUserNamePath(uid)
            )
        )
    );
}

export async function canReadUserEmail(
    db: Database,
    uid: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.User.makeUserEmailPath(uid)
            )
        )
    );
}

export async function canReadUserSharedModels(
    db: Database,
    uid: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserSharedModelsPath(uid)
            )
        )
    );
}

export async function canReadUserSharedModel(
    db: Database,
    uid: string,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeSharedModelPath(uid, modelId)
            )
        )
    );
}

export async function canReadModelOwner(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelOwnerUidPath(modelId)
            )
        )
    );
}

export async function canReadModelName(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelNamePath(modelId)
            )
        )
    );
}

export async function canReadModelType(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelTypePath(modelId)
            )
        )
    );
}

export async function canReadModelSharedUser(
    db: Database,
    modelId: string,
    sharedUid: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeSharedWithUserPath(
                    modelId,
                    sharedUid
                )
            )
        )
    );
}

export async function canReadModelSharedUsers(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeSharedWithUsersPath(modelId)
            )
        )
    );
}

export async function canReadComponents(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeComponentsPath(modelId)
            )
        )
    );
}

export async function canReadComponent(
    db: Database,
    modelId: string,
    componentId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeComponentPath(
                    modelId,
                    componentId
                )
            )
        )
    );
}

export async function canReadSubstitutions(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSubstitutionsPath(modelId)
            )
        )
    )
}

export async function canReadSubstitution(
    db: Database,
    modelId: string,
    replacedId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSubstitutionPath(
                    modelId,
                    replacedId
                )
            )
        )
    );
}

export async function canReadScenarios(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeScenariosPath(modelId)
            )
        )
    );
}

export async function canReadScenario(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioPath(
                    modelId,
                    scenarioId
                )
            )
        )
    );
}

export async function canReadScenarioValue(
    db: Database,
    modelId: string,
    scenarioId: string,
    parameterName: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioComponentPath(
                    modelId,
                    scenarioId,
                    parameterName
                )
            )
        )
    );
}

export async function canReadScenarioStartTime(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioStartTimePath(
                    modelId,
                    scenarioId
                )
            )
        )
    );
}

export async function canReadScenarioStopTime(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioStopTimePath(
                    modelId,
                    scenarioId
                )
            )
        )
    );
}

export async function canReadScenarioName(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioNamePath(
                    modelId,
                    scenarioId
                )
            )
        )
    );
}

export async function canReadStaticModels(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelsPath(modelId)
            )
        )
    );
}

export async function canReadStaticModel(
    db: Database,
    modelId: string,
    staticModelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelPath(
                    modelId,
                    staticModelId
                )
            )
        )
    );
}

export async function canReadStaticModelComponent(
    db: Database,
    modelId: string,
    staticModelId: string,
    componentId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelComponentPath(
                    modelId,
                    staticModelId,
                    componentId
                )
            )
        )
    );
}

export async function canReadPublicModels(
    db: Database
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelsPath()
            )
        )
    );
}

export async function canReadPublicModel(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelPath(modelId)
            )
        )
    );
}
