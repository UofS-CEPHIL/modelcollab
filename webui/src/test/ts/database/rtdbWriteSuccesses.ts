import { assertSucceeds } from "@firebase/rules-unit-testing";
import { ref, remove, set } from "firebase/database";
import { v4 as uuid } from "uuid";
import FirebaseComponent from "../../../main/ts/data/components/FirebaseComponent";
import FirebaseScenario from "../../../main/ts/data/components/FirebaseScenario";
import { ModelType } from "../../../main/ts/data/FirebaseDataModel";
import RTDBSchema, { Permission } from "../../../main/ts/data/RTDBSchema";
import { Database } from "./rtdb.test";

export async function canWriteNewUser(
    db: Database,
    uid: string,
    name: string = "John Smith",
    email: string = "js@example.com",
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.User.makeUserPath(uid)
            ),
            RTDBSchema.User.makeUserData(
                name,
                email,
            )
        )
    );
}

export async function canWriteModelData(
    db: Database,
    modelId: string,
    data: any
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeModelPath(modelId)
            ),
            data
        )
    );
}

export async function canEditUserName(
    db: Database,
    uid: string,
    newName: string = "Fakename McGee"
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.User.makeUserNamePath(uid)
            ),
            newName
        )
    );
}

export async function canEditUserEmail(
    db: Database,
    uid: string,
    newEmail: string = "fake-email@fakesite.gov"
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.User.makeUserEmailPath(uid)
            ),
            newEmail
        )
    );
}

export async function canAddUserOwnedModel(
    db: Database,
    uid: string,
    modelUuid: string,
    val: any = true
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserOwnedModelPath(uid, modelUuid)
            ),
            val
        )
    );
}

export async function canRemoveUserOwnedModel(
    db: Database,
    uid: string,
    modelUuid: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserOwnedModelPath(uid, modelUuid)
            )
        )
    );
}

export async function canRemoveUserEntry(
    db: Database,
    uid: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.User.makeUserPath(uid)
            )
        )
    );
}

export async function canAddModelToUserSharedList(
    db: Database,
    modelId: string,
    sharedUid: string
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserSharedModelPath(
                    sharedUid,
                    modelId
                )
            ),
            true
        )
    );
}

export async function canRemoveSharedModelInPermissions(
    db: Database,
    modelId: string,
    sharedUid: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeUserSharedModelPath(
                    sharedUid,
                    modelId
                )
            )
        )
    );
}

export async function canWriteModelMetadata(
    db: Database,
    modelId: string,
    modelName: string,
    modelType: ModelType,
    ownerUid: string,
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelPath(modelId)
            ),
            RTDBSchema.ModelMetadata.makeMetadataObject(
                ownerUid,
                modelName,
                modelType,
            )
        )
    );
}

export async function canRemoveModelMetadata(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelPath(modelId)
            )
        )
    );
}

export async function canWriteModelName(
    db: Database,
    modelId: string = uuid(),
    modelName: string = "modelname123"
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelMetadata.makeModelNamePath(modelId)
            ),
            modelName
        )
    );
}

export async function canAddModelSharedUserToModelPermissions(
    db: Database,
    modelId: string,
    sharedUid: string,
    permission: Permission = Permission.READWRITE
): Promise<void> {
    await canEditModelSharedUserInModelPermissions(
        db,
        modelId,
        sharedUid,
        permission
    );
}

export async function canEditModelSharedUserInModelPermissions(
    db: Database,
    modelId: string,
    sharedUid: string,
    permission: Permission = Permission.READ
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeModelSharedUserPath(
                    modelId,
                    sharedUid
                )
            ),
            permission
        )
    );
}

export async function canRemoveModelSharedUserFromModelPermissions(
    db: Database,
    modelId: string,
    sharedUid: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makeModelSharedUserPath(
                    modelId,
                    sharedUid
                )
            )
        )
    );
}

export async function canWriteComponent(
    db: Database,
    modelId: string,
    component: FirebaseComponent
): Promise<void> {
    await assertSucceeds(
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

export async function canRemoveComponent(
    db: Database,
    modelId: string,
    componentId: string
): Promise<void> {
    await assertSucceeds(
        remove(
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

export async function canAddScenario(
    db: Database,
    modelId: string,
    scenario: FirebaseScenario = FirebaseScenario.newScenario(uuid(), "s")
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioPath(modelId, scenario.getId())
            ),
            scenario.getData()
        )
    );
}

export async function canEditScenario(
    db: Database,
    modelId: string,
    scenario: FirebaseScenario
): Promise<void> {
    await canAddScenario(db, modelId, scenario);
}

export async function canAddValueToScenario(
    db: Database,
    modelId: string,
    scenarioId: string,
    componentName: string,
    componentValue: string
): Promise<void> {
    await canEditScenarioValue(
        db,
        modelId,
        scenarioId,
        componentName,
        componentValue
    );
}

export async function canEditScenarioValue(
    db: Database,
    modelId: string,
    scenarioId: string,
    componentName: string,
    componentValue: string
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioComponentPath(
                    modelId,
                    scenarioId,
                    componentName
                )
            ),
            componentValue
        )
    );
}

export async function canDeleteScenarioValue(
    db: Database,
    modelId: string,
    scenarioId: string,
    parameterName: string,
): Promise<void> {
    await assertSucceeds(
        remove(
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

export async function canDeleteScenario(
    db: Database,
    modelId: string,
    scenarioId: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeScenarioPath(modelId, scenarioId)
            )
        )
    );
}

export async function canAddSubstitution(
    db: Database,
    modelId: string,
    replacedId: string = uuid(),
    replacementId: string = uuid()
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeSubstitutionPath(modelId, replacedId)
            ),
            replacementId
        )
    );
}

export async function canDeleteSubstitution(
    db: Database,
    modelId: string,
    replacedId: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeSubstitutionPath(modelId, replacedId)
            )
        )
    );
}

export async function canAddStaticModel(
    db: Database,
    modelId: string,
    staticModelId: string = uuid(),
    staticModelComponents: FirebaseComponent[] = []
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelPath(modelId, staticModelId)
            ),
            Object.fromEntries(
                staticModelComponents.map(c => c.toFirebaseEntry())
            )
        )
    );
}

export async function canDeleteStaticModel(
    db: Database,
    modelId: string,
    staticModelId: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeSavedModelPath(modelId, staticModelId)
            )
        )
    );
}

export async function canDeleteModelData(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelData.makeModelPath(modelId)
            )
        )
    );
}

export async function canWritePublicModel(
    db: Database,
    modelId: string,
    visibility: Permission = Permission.READWRITE
): Promise<void> {
    await assertSucceeds(
        set(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelPath(modelId)
            ),
            visibility
        )
    );
}

export async function canRemovePublicModel(
    db: Database,
    modelId: string
): Promise<void> {
    await assertSucceeds(
        remove(
            ref(
                db,
                RTDBSchema.ModelPermissions.makePublicModelPath(modelId)
            )
        )
    );
}
