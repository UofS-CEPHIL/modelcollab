import RTDBSchema from "../../../main/ts/data/RTDBSchema";
import { v4 as uuid } from "uuid";
import { EMAIL_1, NAME_1, UID_1, UUID_1, Database, STOCK_1, UID_3 } from "./rtdb.test";
import { assertFails } from "@firebase/rules-unit-testing";
import { ref, remove, set } from "firebase/database";
import { ModelType } from "../../../main/ts/data/FirebaseDataModel";
import FirebaseStock from "../../../main/ts/data/components/FirebaseStock";
import FirebaseScenario from "../../../main/ts/data/components/FirebaseScenario";
import FirebaseComponent from "../../../main/ts/data/components/FirebaseComponent";
import { Permission } from "../../../main/ts/data/RTDBSchema";

export async function cannotWriteNewUser(
    db: Database,
    uid: string,
    name: string = "John Smith",
    email: string = "js@example.com"
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.User.makeUserPath(uid)
            ),
            RTDBSchema.User.makeUserData(name, email)
        )
    );
}

export async function cannotWriteModelData(
    db: Database,
    modelId: string,
    data: any
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeModelPath(modelId)
            ),
            data
        )
    );
}

export async function cannotEditUserName(
    db: Database,
    uid: string,
    newName: string = "fakename"
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.User.makeUserNamePath(uid)
            ),
            newName
        )
    );
}

export async function cannotEditUserEmail(
    db: Database,
    uid: string,
    newEmail: string = "fake-email12345@fakesite.biz"
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.User.makeUserEmailPath(uid)
            ),
            newEmail
        )
    );
}

export async function cannotAddUserOwnedModel(
    db: Database,
    uid: string,
    modelUuid: string,
    val: any = true
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserModelPath(uid, modelUuid)
            ),
            val
        )
    );
}

export async function cannotRemoveUserOwnedModel(
    db: Database,
    uid: string,
    modelUuid: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserModelPath(uid, modelUuid)
            )
        )
    );
}

export async function cannotRemoveEntireOwnedModelsList(
    db: Database,
    uid: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserModelsPath(uid)
            )
        )
    );
}

export async function cannotRemoveUserEntry(
    db: Database,
    uid: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.User.makeUserPath(uid)
            )
        )
    );
}

export async function cannotRemoveAllUserEntries(
    db: Database
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.User.makePath()
            )
        )
    );
}

export async function cannotShareModelInPermissions(
    db: Database,
    modelId: string,
    sharedUid: string
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeSharedModelPath(
                    sharedUid,
                    modelId
                )
            ),
            true
        )
    );
}

export async function cannotRemoveEntireSharedModelListInPermissions(
    db: Database,
    uid: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserSharedModelsPath(uid)
            )
        )
    );
}

export async function cannotRemoveEntirePublicModelsList(
    db: Database
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelsPath()
            )
        )
    );
}

export async function cannotRemoveSharedModelInPermissions(
    db: Database,
    modelId: string,
    sharedUid: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeSharedModelPath(
                    sharedUid,
                    modelId
                )
            )
        )
    );
}

export async function cannotWriteModelMetadata(
    db: Database,
    modelId: string = uuid(),
    modelName: string = "model",
    modelType: ModelType = ModelType.StockFlow,
    ownerUid: string = UID_1
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelPath(modelId)
            ),
            RTDBSchema.ModelMetadata.makeMetadataObject(
                ownerUid,
                {},
                modelName,
                modelType
            )
        )
    );
}

export async function cannotWriteToModel(db: Database, modelId: string): Promise<void> {
    const UUID1 = uuid();
    const UUID2 = uuid();

    await cannotWriteComponent(db, modelId, STOCK_1);

    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelPath(modelId, UUID1)
            ),
            {
                [`${UUID2}`]: FirebaseStock.createNew(UUID2, 0, 0).getData()
            }
        )
    );
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioPath(modelId, UUID1)
            ),
            FirebaseScenario.newScenario(UUID1, "myscenario")
        )
    );
}

export async function cannotWriteModelOwner(
    db: Database,
    modelId: string = uuid(),
    ownerUid: string = UID_1
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelOwnerUidPath(modelId)
            ),
            ownerUid
        )
    );
}

export async function cannotWriteModelType(
    db: Database,
    modelId: string = uuid(),
    modelType: ModelType = ModelType.StockFlow
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelTypePath(modelId)
            ),
            modelType
        )
    );
}

export async function cannotAddModelSharedUserToMetadata(
    db: Database,
    modelId: string = uuid(),
    sharedUid: string = UID_3,
    permission: Permission = Permission.READWRITE
): Promise<void> {
    await cannotEditModelSharedUserInMetadata(
        db,
        modelId,
        sharedUid,
        permission
    );
}

export async function cannotEditModelSharedUserInMetadata(
    db: Database,
    modelId: string,
    sharedUid: string,
    permission: Permission
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeSharedWithUserPath(
                    modelId,
                    sharedUid
                )
            ),
            permission
        )
    );
}

export async function cannotRemoveModelSharedUserFromMetadata(
    db: Database,
    modelId: string,
    sharedUid: string
): Promise<void> {
    await assertFails(
        remove(
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

export async function cannotRemoveModelSharedUsersFromMetadata(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeSharedWithUsersPath(
                    modelId
                )
            )
        )
    );
}

export async function cannotWriteModelName(
    db: Database,
    modelId: string = uuid(),
    modelName: string = "modelname"
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelNamePath(modelId)
            ),
            modelName
        )
    );
}

export async function cannotWriteComponent(
    db: Database,
    modelId: string,
    component: FirebaseComponent
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeComponentPath(
                    modelId,
                    component.getId()
                )
            ),
            component.toFirebaseEntry()[1]
        )
    );
}

export async function cannotWriteComponentAsData(
    db: Database,
    modelId: string,
    componentId: string,
    componentData: any
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeComponentPath(modelId, componentId)
            ),
            componentData
        )
    );
}

export async function cannotDeleteComponent(
    db: Database,
    modelId: string,
    componentId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeComponentPath(modelId, componentId)
            )
        )
    );
}

export async function cannotAddSubstitution(
    db: Database,
    modelId: string,
    replacedId: string = uuid(),
    replacementId: string = uuid()
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeSubstitutionPath(modelId, replacedId)
            ),
            replacementId
        )
    );
}

export async function cannotEditSubstitution(
    db: Database,
    modelId: string,
    replacedId: string,
    replacementId: string = uuid()
): Promise<void> {
    await cannotAddSubstitution(db, modelId, replacedId, replacementId);
}

export async function cannotDeleteSubstitution(
    db: Database,
    modelId: string,
    replacedId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeSubstitutionPath(modelId, replacedId)
            )
        )
    );
}

export async function cannotAddScenario(
    db: Database,
    modelId: string,
    scenario: FirebaseScenario = FirebaseScenario.newScenario(uuid(), "S")
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioPath(modelId, scenario.getId())
            ),
            scenario.getData()
        )
    );
}

export async function cannotAddScenarioAsData(
    db: Database,
    modelId: string,
    scenarioId: string,
    scenarioValue: any
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeScenariosPath(modelId)
                + `/${scenarioId}`
            ),
            scenarioValue
        )
    );
}

export async function cannotEditScenario(
    db: Database,
    modelId: string,
    scenario: FirebaseScenario
): Promise<void> {
    await cannotAddScenario(db, modelId, scenario);
}

export async function cannotDeleteScenario(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioPath(modelId, scenarioId)
            )
        )
    );
}

export async function cannotDeleteModelData(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeModelPath(modelId)
            )
        )
    );
}

export async function cannotDeleteEntireModelDataList(
    db: Database
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makePath()
            )
        )
    );
}

export async function cannotAddStaticModel(
    db: Database,
    modelId: string,
    staticModelId: string = uuid(),
    staticModelComponents: FirebaseComponent[] = [STOCK_1]
): Promise<void> {
    const cpts = Object.fromEntries(
        staticModelComponents.map(c =>
            [c.getId(), c.getData()]
        )
    );
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelPath(modelId, staticModelId)
            ),
            cpts
        )
    );
}

export async function cannotDeleteStaticModel(
    db: Database,
    modelId: string,
    staticModelId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelPath(modelId, staticModelId)
            )
        )
    );
}

export async function cannotWriteStaticModelComponent(
    db: Database,
    modelId: string,
    staticModelId: string,
    component: FirebaseComponent
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelComponentPath(
                    modelId,
                    staticModelId,
                    component.getId()
                )
            ),
            component.toFirebaseEntry()[1]
        )
    );
}

export async function cannotDeleteStaticModelComponent(
    db: Database,
    modelId: string,
    staticModelId: string,
    componentId: string
): Promise<void> {
    await assertFails(
        remove(
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

export async function cannotWriteUnexpectedLocations(
    db: Database
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                "/test"
            ),
            1234
        )
    );
    await assertFails(
        set(
            ref(
                db,
                "/parent/child"
            ),
            "value"
        )
    );
    await assertFails(
        set(
            ref(
                db,
                "/parent/c1/c2"
            ),
            false
        )
    )
}

export async function cannotWritePublicModel(
    db: Database,
    modelId: string,
    visibility: Permission = Permission.READWRITE
): Promise<void> {
    await assertFails(
        set(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelPath(modelId)
            ),
            visibility
        )
    );
}

export async function cannotRemovePublicModel(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelPath(modelId)
            )
        )
    );
}

export async function cannotRemoveAllModelMetadata(
    db: Database
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelMetadata.makePath()
            )
        )
    );
}

export async function cannotRemoveModelMetadata(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelPath(modelId)
            )
        )
    );
}

export async function cannotRemoveModelName(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelNamePath(modelId)
            )
        )
    );
}

export async function cannotRemoveModelType(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelTypePath(modelId)
            )
        )
    );
}

export async function cannotRemoveModelOwner(
    db: Database,
    modelId: string
): Promise<void> {
    await assertFails(
        remove(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelOwnerUidPath(modelId)
            )
        )
    );
}

export async function cannotWriteAnything(db: Database): Promise<void> {
    await cannotWriteUnexpectedLocations(db);
    await cannotWriteNewUser(db, UID_1, NAME_1, EMAIL_1);
    await cannotWriteModelMetadata(db);
    await cannotWriteToModel(db, UUID_1);
}
