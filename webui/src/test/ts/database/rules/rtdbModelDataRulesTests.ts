import { v4 as uuid } from "uuid";
import FirebaseScenario from "../../../../main/ts/data/components/FirebaseScenario";
import FirebaseStock from "../../../../main/ts/data/components/FirebaseStock";
import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import { Permission } from "../../../../main/ts/data/RTDBSchema";
import { cannotReadComponent, cannotReadComponents, cannotReadScenario, cannotReadScenarioName, cannotReadScenarios, cannotReadScenarioStartTime, cannotReadScenarioStopTime, cannotReadScenarioValue, cannotReadStaticModel, cannotReadStaticModelComponent, cannotReadStaticModels, cannotReadSubstitution, cannotReadSubstitutions } from "../rtdbReadFailures";
import { canReadComponent, canReadComponents, canReadScenario, canReadScenarioName, canReadScenarios, canReadScenarioStartTime, canReadScenarioStopTime, canReadScenarioValue, canReadStaticModel, canReadStaticModelComponent, canReadStaticModels, canReadSubstitution, canReadSubstitutions } from "../rtdbReadSuccesses";
import { EMAIL_1, EMAIL_2, EMAIL_3, MODELID_1, MODELNAME_1, NAME_1, NAME_2, NAME_3, PARAM_1, STOCK_1, UID_1, UID_2, UID_3, Database, getDb, UID_UNAUTHENTICATED, COMPONENT_1, SUB_REPLACED_ID, SUB_REPLACEMENT_ID, SCENARIO, STATIC_MODEL_ID, COMPONENT_2, env } from "../rtdb.test";
import { cannotAddScenario, cannotAddStaticModel, cannotAddSubstitution, cannotDeleteComponent, cannotDeleteScenario, cannotDeleteStaticModel, cannotDeleteSubstitution, cannotEditScenario, cannotWriteStaticModelComponent, cannotEditSubstitution, cannotWriteComponent, cannotDeleteStaticModelComponent, cannotDeleteEntireModelDataList, cannotDeleteModelData } from "../rtdbWriteFailures";
import { canAddModelSharedUserToMetadata, canAddScenario, canAddStaticModel, canAddSubstitution, canAddValueToScenario, canDeleteModelData, canDeleteScenario, canDeleteScenarioValue, canDeleteStaticModel, canDeleteSubstitution, canEditModelSharedUserInMetadata, canEditScenario, canEditScenarioValue, canRemoveComponent, canWriteComponent, canWriteModelMetadata, canWriteNewUser, canWritePublicModel } from "../rtdbWriteSuccesses";

export async function setupModelComponents(
    db: Database,
    modelId: string
): Promise<void> {
    await canWriteComponent(
        db,
        modelId,
        COMPONENT_1
    );
    await canAddSubstitution(
        db,
        modelId,
        SUB_REPLACED_ID,
        SUB_REPLACEMENT_ID
    );
    await canAddScenario(
        db,
        modelId,
        SCENARIO
    );
    await canAddStaticModel(
        db,
        modelId,
        STATIC_MODEL_ID,
        [STOCK_1, PARAM_1]
    );
}

export default function describeModelDataRulesTests(): void {

    describe("Model data", () => {

        beforeEach(async () => {
            await canWriteNewUser(
                getDb(UID_1),
                UID_1,
                NAME_1,
                EMAIL_1
            );
            await canWriteNewUser(
                getDb(UID_2),
                UID_2,
                NAME_2,
                EMAIL_2
            );
            await canWriteNewUser(
                getDb(UID_3),
                UID_3,
                NAME_3,
                EMAIL_3
            );
        });

        function noWritePermissionTests(
            userUid: string,
            modelId: string
        ): (() => void) {
            return () => {

                let db: Database | null = null;

                beforeEach(async () => {
                    db = getDb(userUid);
                    await env!.withSecurityRulesDisabled(async ctx =>
                        await setupModelComponents(ctx.database(), modelId)
                    );
                });

                test(
                    "Not permitted to write model component",
                    async () => await cannotWriteComponent(
                        db!,
                        modelId,
                        COMPONENT_2
                    )
                );

                test(
                    "Not permitted to edit an existing component",
                    async () => await cannotWriteComponent(
                        db!,
                        modelId,
                        COMPONENT_1.withData({
                            ...COMPONENT_1.getData(),
                            text: "NewText"
                        })
                    )
                );

                test(
                    "Not permitted to delete an existing component",
                    async () => await cannotDeleteComponent(
                        db!,
                        modelId,
                        COMPONENT_1.getId()
                    )
                );

                test(
                    "Not permitted to add a new substitution",
                    async () => await cannotAddSubstitution(
                        db!,
                        modelId,
                        uuid(),
                        uuid()
                    )
                );

                test(
                    "Not permitted to edit an existing substitution",
                    async () => await cannotEditSubstitution(
                        db!,
                        modelId,
                        SUB_REPLACED_ID
                    )
                );

                test(
                    "Not permitted to delete an existing substitution",
                    async () => await cannotDeleteSubstitution(
                        db!,
                        modelId,
                        SUB_REPLACED_ID
                    )
                );

                test(
                    "Not permitted to write scenario",
                    async () => await cannotAddScenario(
                        db!,
                        modelId,
                        new FirebaseScenario(
                            uuid(),
                            {
                                name: "s",
                                startTime: "0.0",
                                stopTime: "100.0",
                                overrides: {}
                            }
                        )
                    )
                );

                test(
                    "Not permitted to add value to existing scenario",
                    async () => await cannotEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            overrides: {
                                ...SCENARIO.getData().overrides,
                                [`${uuid()}`]: "NewValue"
                            }
                        })
                    )
                );

                test(
                    "Not permitted to change existing value in " +
                    "existing scenario",
                    async () => await cannotEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            overrides: {
                                [`${COMPONENT_1.getData().text}`]: "A New Value"
                            }
                        })
                    )
                );

                test(
                    "Not permitted to delete existing value from " +
                    "existing scenario",
                    async () => await cannotEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            overrides: {}
                        })
                    )
                );

                test(
                    "Not permitted to edit scenario name",
                    async () => await cannotEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            name: "NewScenarioName"
                        })
                    )
                );

                test(
                    "Not permitted to edit scenario start time",
                    async () => await cannotEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            startTime: "-100.0"
                        })
                    )
                );

                test(
                    "Not permitted to edit scenario stop time",
                    async () => await cannotEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            stopTime: "99999.019"
                        })
                    )
                );

                test(
                    "Not permitted to delete existing scenario",
                    async () => await cannotDeleteScenario(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Not permitted to add a saved model",
                    async () => await cannotAddStaticModel(
                        db!,
                        modelId
                    )
                );

                test(
                    "Not permitted to delete an existing saved model",
                    async () => await cannotDeleteStaticModel(
                        db!,
                        modelId,
                        STATIC_MODEL_ID
                    )
                );

                test(
                    "Not permitted to edit components in an " +
                    "existing saved model",
                    async () => await cannotWriteStaticModelComponent(
                        db!,
                        modelId,
                        STATIC_MODEL_ID,
                        STOCK_1.withData({
                            ...STOCK_1.getData(),
                            text: "asdfasdfasdf"
                        })
                    )
                );

                test(
                    "Not permitted to add components to an " +
                    "existing saved model",
                    async () => await cannotWriteStaticModelComponent(
                        db!,
                        modelId,
                        STATIC_MODEL_ID,
                        PARAM_1
                    )
                );

                test(
                    "Not permitted to delete components from an " +
                    "existing saved model",
                    async () => await cannotDeleteStaticModelComponent(
                        db!,
                        modelId,
                        STATIC_MODEL_ID,
                        STOCK_1.getId()
                    )
                );

                test(
                    "Not permitted to delete the model",
                    async () => await cannotDeleteModelData(
                        db!,
                        modelId
                    )
                );

                test(
                    "Not permitted to delete the entire model data list",
                    async () => await cannotDeleteEntireModelDataList(
                        db!
                    )
                );
            }
        }

        function noReadPermissionTests(
            userUid: string,
            modelId: string
        ): (() => void) {
            return () => {

                let db: Database | null = null;

                beforeEach(async () => {
                    db = getDb(userUid);
                    await env!.withSecurityRulesDisabled(async ctx =>
                        await setupModelComponents(ctx.database(), modelId)
                    );
                });

                test(
                    "Not permitted to read all model components",
                    async () => await cannotReadComponents(
                        db!,
                        modelId
                    )
                );

                test(
                    "Not permitted to read a particular model component",
                    async () => await cannotReadComponent(
                        db!,
                        modelId,
                        COMPONENT_1.getId()
                    )
                );

                test(
                    "Not permitted to read all substitutions",
                    async () => await cannotReadSubstitutions(
                        db!,
                        modelId
                    )
                );

                test(
                    "Not permitted to read a particular substitution",
                    async () => await cannotReadSubstitution(
                        db!,
                        modelId,
                        SUB_REPLACED_ID
                    )
                );

                test(
                    "Not permitted to read all model scenarios",
                    async () => await cannotReadScenarios(
                        db!,
                        modelId
                    )
                );

                test(
                    "Not permitted to read a particular model scenario",
                    async () => await cannotReadScenario(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Not permitted to read scenario start time",
                    async () => await cannotReadScenarioStartTime(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Not permitted to read scenario stop time",
                    async () => await cannotReadScenarioStopTime(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Not permitted to read scenario name",
                    async () => await cannotReadScenarioName(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Not permitted to read a particular override from a "
                    + "particular model scenario",
                    async () => await cannotReadScenarioValue(
                        db!,
                        modelId,
                        SCENARIO.getId(),
                        Object.keys(SCENARIO.getData().overrides!)[0]
                    )
                );

                test(
                    "Not permitted to read all static models",
                    async () => await cannotReadStaticModels(
                        db!,
                        modelId
                    )
                );

                test(
                    "Not permitted to read a particular static " +
                    "model's components",
                    async () => await cannotReadStaticModel(
                        db!,
                        modelId,
                        STATIC_MODEL_ID
                    )
                );

                test(
                    "Not permitted to read a particular component " +
                    "from a particular static model",
                    async () => await cannotReadStaticModelComponent(
                        db!,
                        modelId,
                        STATIC_MODEL_ID,
                        STOCK_1.getId()
                    )
                );
            }
        }

        function hasReadPermissionTests(
            userUid: string,
            modelId: string
        ): (() => void) {
            return () => {

                let db: Database | null = null;

                beforeEach(async () => {
                    db = getDb(userUid);
                    await env!.withSecurityRulesDisabled(async ctx =>
                        await setupModelComponents(ctx.database(), modelId)
                    );
                });

                test(
                    "Permitted to read all model components",
                    async () => await canReadComponents(
                        db!,
                        modelId
                    )
                );

                test(
                    "Permitted to read a particular model component",
                    async () => await canReadComponent(
                        db!,
                        modelId,
                        COMPONENT_1.getId()
                    )
                );

                test(
                    "Permitted to read all substitutions",
                    async () => await canReadSubstitutions(
                        db!,
                        modelId
                    )
                );

                test(
                    "Permitted to read a particular substitution",
                    async () => await canReadSubstitution(
                        db!,
                        modelId,
                        SUB_REPLACED_ID
                    )
                );

                test(
                    "Permitted to read all model scenarios",
                    async () => await canReadScenarios(
                        db!,
                        modelId
                    )
                );

                test(
                    "Permitted to read a particular model scenario",
                    async () => await canReadScenario(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Permitted to read start time from a particular scenario",
                    async () => await canReadScenarioStartTime(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Permitted to read stop time from a particular scenario",
                    async () => await canReadScenarioStopTime(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Permitted to read scenario name",
                    async () => await canReadScenarioName(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Permitted to read a particular override from a " +
                    "particular model scenario",
                    async () => await canReadScenarioValue(
                        db!,
                        modelId,
                        SCENARIO.getId(),
                        Object.keys(SCENARIO.getData().overrides!)[0]
                    )
                );

                test(
                    "Permitted to read all static models",
                    async () => await canReadStaticModels(
                        db!,
                        modelId
                    )
                );

                test(
                    "Permitted to read a particular static model's components",
                    async () => await canReadStaticModel(
                        db!,
                        modelId,
                        STATIC_MODEL_ID
                    )
                );

                test(
                    "Permitted to read a particular component from a " +
                    "particular static model",
                    async () => await canReadStaticModelComponent(
                        db!,
                        modelId,
                        STATIC_MODEL_ID,
                        STOCK_1.getId()
                    )
                );
            }
        }

        function hasWritePermissionTests(
            userUid: string,
            modelId: string
        ): (() => void) {
            return () => {


                let db: Database | null = null;

                beforeEach(async () => {
                    db = getDb(userUid);
                    await env!.withSecurityRulesDisabled(async ctx =>
                        await setupModelComponents(ctx.database(), modelId)
                    );
                });

                test(
                    "Permitted to add model component",
                    async () => await canWriteComponent(db!, modelId, PARAM_1)
                );

                test(
                    "Permitted to edit model component",
                    async () => await canWriteComponent(
                        db!,
                        modelId,
                        STOCK_1.withData({ ...STOCK_1.getData(), x: 1234 })
                    )
                );

                test(
                    "Permitted to delete model component",
                    async () => await canRemoveComponent(
                        db!,
                        modelId,
                        STOCK_1.getId()
                    )
                );

                test(
                    "Permitted to add scenario",
                    async () => await canAddScenario(
                        db!,
                        modelId
                    )
                );

                test(
                    "Permitted to add value to scenario",
                    async () => await canAddValueToScenario(
                        db!,
                        modelId,
                        SCENARIO.getId(),
                        "name",
                        "123"
                    )
                );

                test(
                    "Permitted to edit scenario start time",
                    async () => await canEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            startTime: "-0.001"
                        })
                    )
                );

                test(
                    "Permitted to edit scenario stop time",
                    async () => await canEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            stopTime: "2233123.0"
                        })
                    )
                );

                test(
                    "Permitted to edit scenario name",
                    async () => await canEditScenario(
                        db!,
                        modelId,
                        SCENARIO.withData({
                            ...SCENARIO.getData(),
                            name: "NewScenarioName"
                        })
                    )
                );

                test(
                    "Permitted to edit scenario value",
                    async () => await canEditScenarioValue(
                        db!,
                        modelId,
                        SCENARIO.getId(),
                        COMPONENT_1.getData().text,
                        "0.01"
                    )
                );

                test(
                    "Permitted to delete scenario value",
                    async () => await canDeleteScenarioValue(
                        db!,
                        modelId,
                        SCENARIO.getId(),
                        COMPONENT_1.getId()
                    )
                );

                test(
                    "Permitted to delete entire scenario",
                    async () => await canDeleteScenario(
                        db!,
                        modelId,
                        SCENARIO.getId()
                    )
                );

                test(
                    "Permitted to add substitution",
                    async () => await canAddSubstitution(
                        db!,
                        modelId
                    )
                );

                test(
                    "Permitted to delete substitution",
                    async () => await canDeleteSubstitution(
                        db!,
                        modelId,
                        SUB_REPLACED_ID
                    )
                );

                test(
                    "Not permitted to edit existing substitution",
                    async () => await cannotAddSubstitution(
                        db!,
                        modelId,
                        SUB_REPLACED_ID,
                        uuid()
                    )
                );

                test(
                    "Permitted to add static model",
                    async () => await canAddStaticModel(
                        db!,
                        modelId,
                        uuid(),
                        [PARAM_1, STOCK_1]
                    )
                );

                test(
                    "Permitted to delete static model",
                    async () => await canDeleteStaticModel(
                        db!,
                        modelId,
                        STATIC_MODEL_ID
                    )
                );

                test(
                    "Not permitted to delete an individual component " +
                    "from a static model",
                    async () => await cannotDeleteStaticModelComponent(
                        db!,
                        modelId,
                        STATIC_MODEL_ID,
                        STOCK_1.getId()
                    )
                );

                test(
                    "Not permitted to edit an individual component " +
                    "in a static model",
                    async () => await cannotWriteStaticModelComponent(
                        db!,
                        modelId,
                        STATIC_MODEL_ID,
                        STOCK_1.withData({
                            ...STOCK_1.getData(),
                            x: 100,
                            y: 100,
                            text: "fake name"
                        })
                    )
                );

                test(
                    "Not permitted to add a component to a static model",
                    async () => await cannotWriteStaticModelComponent(
                        db!,
                        modelId,
                        STATIC_MODEL_ID,
                        FirebaseStock.createNew(uuid(), -1, -1)
                    )
                );

                test(
                    "Not permitted to delete the entire model data list",
                    async () => await cannotDeleteEntireModelDataList(
                        db!
                    )
                );

                test(
                    "Permitted to delete the entire model",
                    async () => await canDeleteModelData(
                        db!,
                        modelId
                    )
                );
            }
        }

        function hasPermissionTests(
            userUid: string,
            modelId: string
        ): (() => void) {
            return () => {
                describe(
                    "Has read permissions",
                    hasReadPermissionTests(userUid, modelId)
                );
                describe(
                    "Has write permissions",
                    hasWritePermissionTests(userUid, modelId)
                );
            }
        }

        function noPermissionTests(
            userUid: string,
            modelId: string
        ): (() => void) {
            return () => {
                describe(
                    "No write permissions",
                    noWritePermissionTests(userUid, modelId)
                );
                describe(
                    "No read permissions",
                    noReadPermissionTests(userUid, modelId)
                );
            }
        }

        function readOnlyTests(
            userUid: string,
            modelId: string
        ): (() => void) {
            return () => {
                describe(
                    "Has read permissions",
                    hasReadPermissionTests(userUid, modelId)
                );
                describe(
                    "No write permissions",
                    noWritePermissionTests(userUid, modelId)
                );
            }
        }

        describe("Model Metadata Doesn't Exist", () => {
            describe(
                "Authenticated User",
                noPermissionTests(
                    UID_1,
                    MODELID_1
                )
            );
            describe(
                "Unauthenticated User",
                noPermissionTests(
                    UID_UNAUTHENTICATED,
                    MODELID_1
                )
            );
        });

        describe("Model Metadata Exists", () => {
            beforeEach(async () =>
                await env!.withSecurityRulesDisabled(
                    async ctx => {
                        const db = ctx.database();
                        await canWriteModelMetadata(
                            db,
                            MODELID_1,
                            MODELNAME_1,
                            ModelType.StockFlow,
                            UID_1
                        );
                        await canAddModelSharedUserToMetadata(
                            db,
                            MODELID_1,
                            UID_2,
                            Permission.READWRITE
                        );
                    }
                )
            );

            describe("Private model", () => {
                describe(
                    "Owner",
                    hasPermissionTests(UID_1, MODELID_1)
                );

                describe("Read-Only Shared User", () => {

                    beforeEach(async () =>
                        await canEditModelSharedUserInMetadata(
                            getDb(UID_1),
                            MODELID_1,
                            UID_2,
                            Permission.READ
                        )
                    );

                    readOnlyTests(UID_2, MODELID_1)();
                });

                describe(
                    "Read-Write Shared User",
                    hasPermissionTests(UID_2, MODELID_1)
                );

                describe(
                    "Non-Shared User",
                    noPermissionTests(UID_3, MODELID_1)
                );

                describe(
                    "Unauthenticated user",
                    noPermissionTests(UID_UNAUTHENTICATED, MODELID_1)
                );
            });

            describe("Read-Only Public Model", () => {

                beforeEach(async () =>
                    await env!.withSecurityRulesDisabled(async ctx =>
                        await canWritePublicModel(
                            ctx.database(),
                            MODELID_1,
                            Permission.READ
                        )
                    )
                );

                describe(
                    "Owner",
                    hasPermissionTests(UID_1, MODELID_1)
                );

                describe("Read-Only Shared User", () => {

                    beforeEach(async () =>
                        await canEditModelSharedUserInMetadata(
                            getDb(UID_1),
                            MODELID_1,
                            UID_2,
                            Permission.READ
                        )
                    );

                    readOnlyTests(UID_2, MODELID_1)();
                });

                describe(
                    "Read-Write Shared User",
                    hasPermissionTests(UID_2, MODELID_1)
                );

                describe(
                    "Non-Shared User",
                    readOnlyTests(UID_3, MODELID_1)
                );

                describe(
                    "Unauthenticated user",
                    noPermissionTests(UID_UNAUTHENTICATED, MODELID_1)
                );
            });

            describe("Read/Write Public Model", () => {

                beforeEach(async () =>
                    await env!.withSecurityRulesDisabled(async ctx =>
                        await canWritePublicModel(
                            ctx.database(),
                            MODELID_1,
                            Permission.READWRITE
                        )
                    )
                );

                describe(
                    "Owner",
                    hasPermissionTests(UID_1, MODELID_1)
                );

                describe("Read-Only Shared User", () => {

                    beforeEach(async () =>
                        await canEditModelSharedUserInMetadata(
                            getDb(UID_1),
                            MODELID_1,
                            UID_2,
                            Permission.READ
                        )
                    );

                    hasPermissionTests(UID_2, MODELID_1)();
                });

                describe(
                    "Read-Write Shared User",
                    hasPermissionTests(UID_2, MODELID_1)
                );

                describe(
                    "Non-Shared User",
                    hasPermissionTests(UID_3, MODELID_1)
                );

                describe(
                    "Unauthenticated user",
                    noPermissionTests(UID_UNAUTHENTICATED, MODELID_1)
                );
            });
        });
    });
}
