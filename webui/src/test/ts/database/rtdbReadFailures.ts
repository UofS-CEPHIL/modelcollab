import RTDBSchema from "../../../main/ts/data/RTDBSchema";
import { v4 as uuid } from "uuid";
import { UID_1, Database } from "./rtdb.test";
import { assertFails } from "@firebase/rules-unit-testing";
import { ref, get } from "firebase/database";

export async function cannotReadUnexpectedLocations(db: Database): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                "/this/path/doesnt/exist"
            )
        )
    );
    await assertFails(
        get(
            ref(
                db,
                "/fakekey"
            )
        )
    );
}

export async function cannotReadModelSharedUser(
    db: Database,
    modelId: string,
    sharedUid: string
): Promise<void> {
    await assertFails(
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

export async function cannotReadModelData(
    db: Database,
    modelId: string
): Promise<void> {

    const UUID = uuid();

    await cannotReadComponents(db, modelId);
    await cannotReadComponent(db, modelId, UUID);
    await cannotReadScenarios(db, modelId);
    await cannotReadScenario(db, modelId, UUID);
    await cannotReadScenarioName(db, modelId, UUID);
    await cannotReadScenarioStartTime(db, modelId, UUID);
    await cannotReadScenarioStopTime(db, modelId, UUID);
    await cannotReadScenarioValue(db, modelId, UUID, uuid());
    await cannotReadStaticModels(db, modelId);
    await cannotReadStaticModel(db, modelId, UUID);
    await cannotReadStaticModelComponent(db, modelId, UUID, uuid());
    await cannotReadSubstitutions(db, modelId);
    await cannotReadSubstitution(db, modelId, UUID);
}

export async function cannotReadComponents(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeComponentsPath(modelId)
            )
        )
    );
}

export async function cannotReadComponent(
    db: Database,
    modelId: string,
    componentId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeComponentPath(modelId, componentId)
            )
        )
    );
}

export async function cannotReadSubstitutions(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSubstitutionsPath(modelId)
            )
        )
    );
}

export async function cannotReadSubstitution(
    db: Database,
    modelId: string,
    replacedId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSubstitutionPath(modelId, replacedId)
            )
        )
    );
}

export async function cannotReadScenarios(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeScenariosPath(modelId)
            )
        )
    );
}

export async function cannotReadScenario(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioPath(modelId, scenarioId)
            )
        )
    );
}

export async function cannotReadScenarioValue(
    db: Database,
    modelId: string,
    scenarioId: string,
    parameterName: string
): Promise<void> {
    await assertFails(
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

export async function cannotReadScenarioStartTime(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertFails(
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

export async function cannotReadScenarioStopTime(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertFails(
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

export async function cannotReadScenarioName(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertFails(
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

export async function cannotReadStaticModels(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelsPath(modelId)
            )
        )
    );
}

export async function cannotReadStaticModel(
    db: Database,
    modelId: string,
    staticModelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelPath(modelId, staticModelId)
            )
        )
    );
}

export async function cannotReadStaticModelComponent(
    db: Database,
    modelId: string,
    staticModelId: string,
    componentId: string
): Promise<void> {
    await assertFails(
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

export async function cannotReadModelName(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelNamePath(modelId)
            )
        )
    );
}

export async function cannotReadModelOwner(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelOwnerUidPath(modelId)
            )
        )
    );
}

export async function cannotReadModelType(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelTypePath(modelId)
            )
        )
    )
}

export async function cannotReadUserInfo(
    db: Database,
    uid: string
): Promise<void> {
    await cannotReadUserName(db, uid);
    await cannotReadUserEmail(db, uid);
    await cannotReadUserSharedModels(db, uid);
}

export async function cannotReadUserName(
    db: Database,
    uid: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.User.makeUserNamePath(uid)
            )
        )
    );
}

export async function cannotReadUserEmail(
    db: Database,
    uid: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.User.makeUserEmailPath(uid)
            )
        )
    );
}

export async function cannotReadUserOwnedModels(
    db: Database,
    uid: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserModelsPath(uid)
            )
        )
    );
}

export async function cannotReadUserOwnedModel(
    db: Database,
    uid: string,
    modelUuid: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserModelPath(uid, modelUuid)
            )
        )
    );
}

export async function cannotReadUserSharedModels(
    db: Database,
    uid: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserSharedModelsPath(uid)
            )
        )
    );
}

export async function cannotReadUserSharedModel(
    db: Database,
    uid: string,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeSharedModelPath(uid, modelId)
            )
        )
    );
}

export async function cannotReadPublicModels(
    db: Database
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelsPath()
            )
        )
    );
}

export async function cannotReadPublicModel(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        get(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelPath(modelId)
            )
        )
    );
}

export async function cannotReadAnything(
    db: Database
): Promise<void> {
    await cannotReadUnexpectedLocations(db);
    await cannotReadModelData(db, uuid());
    await cannotReadUserInfo(db, UID_1);
    await cannotReadUserSharedModels(db, UID_1)
    await cannotReadUserSharedModel(db, UID_1, uuid())
}
