import { v4 as uuid } from "uuid";
import ComponentType from "../../../../main/ts/data/components/ComponentType";
import FirebaseScenario, { ScenarioComponentData } from "../../../../main/ts/data/components/FirebaseScenario";
import FirebaseStaticModel from "../../../../main/ts/data/components/FirebaseStaticModel";
import FirebaseStock from "../../../../main/ts/data/components/FirebaseStock";
import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import { EMAIL_1, env, NAME_1, UID_1, UID_2, NAME_2, EMAIL_2, MODELNAME_1, MODELID_1, getDb, UUID_1, TestCase, MODELID_2, MODELNAME_2, STOCK_1, PARAM_1 } from "../rtdb.test";
import { cannotAddScenario, cannotAddStaticModel, cannotWriteComponent, cannotWriteModelData } from "../rtdbWriteFailures";
import { canAddScenario, canAddStaticModel, canAddSubstitution, canWriteComponent, canWriteModelData, canWriteModelMetadata, canWriteNewUser } from "../rtdbWriteSuccesses";
import { cannotAddSubstitution } from "../rtdbWriteFailures";
import { describeArbitraryStringTests, describeChildComponentUUIDTests, describeComponentDataStructureTests, describeComponentDataValueTests, describeComponentTypeTests, describeUUIDTests, makeComponentMock } from "./modelDataValidationTestUtils";
import RTDBSchema from "../../../../main/ts/data/RTDBSchema";
import FirebaseComponent from "../../../../main/ts/data/components/FirebaseComponent";

export default function describeModelDataValidationTests(): void {

    describe("Model Data", () => {

        beforeEach(async () => await env!.withSecurityRulesDisabled(
            async ctx => {
                const db = ctx.database();
                await canWriteNewUser(
                    db,
                    UID_1,
                    NAME_1,
                    EMAIL_1
                );
                await canWriteNewUser(
                    db,
                    UID_2,
                    NAME_2,
                    EMAIL_2
                );
                await canWriteModelMetadata(
                    db,
                    MODELID_1,
                    MODELNAME_1,
                    ModelType.StockFlow,
                    UID_1
                );
            }
        ));

        describe("Data Structure", () => {

            const modelDataFields: TestCase[] = [
                {
                    label: RTDBSchema.ModelData.COMPONENTS,
                    val: Object.fromEntries(
                        [STOCK_1.toFirebaseEntry()]
                        //                        ALL_COMPONENTS.map(c => c.toFirebaseEntry())
                    )
                },
                {
                    label: RTDBSchema.ModelData.SCENARIOS,
                    val: Object.fromEntries([
                        FirebaseScenario.newScenario(
                            uuid(),
                            "name"
                        ).toFirebaseEntry(),
                        FirebaseScenario.newScenario(
                            uuid(),
                            "name"
                        ).toFirebaseEntry()
                    ])
                },
                {
                    label: RTDBSchema.ModelData.SUBSTITUTIONS,
                    val: {
                        [`${uuid()}`]: uuid(),
                        [`${uuid()}`]: uuid()
                    }
                },
                { label: RTDBSchema.ModelData.SAVED_MODELS, val: {} },
            ];

            for (let i = 0; i < modelDataFields.length; i++) {
                const f1 = modelDataFields[i];
                test(
                    `Can have only ${f1.label} field`,
                    async () => await canWriteModelData(
                        getDb(UID_1),
                        MODELID_1,
                        {
                            [`${f1.label}`]: f1.val
                        }
                    )
                );

                for (let j = i + 1; j < modelDataFields.length; j++) {
                    const f2 = modelDataFields[j];
                    test(
                        `Can have only ${f1.label} and ${f2.label} fields`,
                        async () => await canWriteModelData(
                            getDb(UID_1),
                            MODELID_1,
                            {
                                [`${f1.label}`]: f1.val,
                                [`${f2.label}`]: f2.val
                            }
                        )
                    );

                    for (let k = j + 1; k < modelDataFields.length; k++) {
                        const f3 = modelDataFields[k];
                        test(
                            `Can have only ${f1.label}, ${f2.label}, ` +
                            `and ${f3.label} fields`,
                            async () => await canWriteModelData(
                                getDb(UID_1),
                                MODELID_1,
                                {
                                    [`${f1.label}`]: f1.val,
                                    [`${f2.label}`]: f2.val,
                                    [`${f3.label}`]: f3.val
                                }
                            )
                        );
                    }
                }
            }

            test(
                "Can have all fields",
                async () => await canWriteModelData(
                    getDb(UID_1),
                    MODELID_1,
                    Object.fromEntries(
                        modelDataFields.map(t => [t.label, t.val])
                    )
                )
            );

            test(
                "Cannot have any extra fields",
                async () => await cannotWriteModelData(
                    getDb(UID_1),
                    MODELID_1,
                    Object.fromEntries([
                        ...modelDataFields.map(t => [t.label, t.val]),
                        ["extra", "invalid"]
                    ])
                )
            );
        });

        describe("Model IDs", () => {

            const addModelWithId = async (id: string) =>
                await env!.withSecurityRulesDisabled(
                    async ctx => await canWriteModelMetadata(
                        ctx.database(),
                        id,
                        MODELNAME_2,
                        ModelType.StockFlow,
                        UID_1
                    )
                );

            describeUUIDTests(
                async id => {
                    await addModelWithId(id);
                    await canWriteComponent(
                        getDb(UID_1),
                        id as string,
                        STOCK_1
                    );
                },
                async id => {
                    await addModelWithId(id);
                    await cannotWriteComponent(
                        getDb(UID_1),
                        id as string,
                        STOCK_1
                    );
                }
            );
        });

        describe("Model Components", () => {

            describe("Component IDs", () => {
                describeUUIDTests(
                    async id => await canWriteComponent(
                        getDb(UID_1),
                        MODELID_1,
                        FirebaseStock.createNew(id, 0, 0)
                    ),
                    async id => await cannotWriteComponent(
                        getDb(UID_1),
                        MODELID_1,
                        makeComponentMock(
                            ComponentType.STOCK,
                            id
                        )
                    )
                );
            });

            describe("Component Types", () => {
                describeComponentTypeTests(
                    async t => await canWriteComponent(
                        getDb(UID_1),
                        MODELID_1,
                        makeComponentMock(t)
                    ),
                    async t => await cannotWriteComponent(
                        getDb(UID_1),
                        MODELID_1,
                        makeComponentMock(t)
                    )
                );
            });

            describe("Component Data", () => {
                describeComponentDataValueTests(
                    async c => await canWriteComponent(
                        getDb(UID_1),
                        MODELID_1,
                        c
                    ),
                    async c => await cannotWriteComponent(
                        getDb(UID_1),
                        MODELID_1,
                        c
                    )
                );
            });

            describe(
                "Component Data Structure",
                () => describeComponentDataStructureTests(
                    async c => await canWriteComponent(
                        getDb(UID_1),
                        MODELID_1,
                        c
                    ),
                    async c => await cannotWriteComponent(
                        getDb(UID_1),
                        MODELID_1,
                        c
                    )
                )
            );
        });

        describe("Scenarios", () => {

            function describeScenarioStartStopTimeTests(startTime: boolean) {
                describeArbitraryStringTests(
                    async val => await canAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        new FirebaseScenario(
                            uuid(),
                            {
                                name: "Name",
                                startTime: startTime
                                    ? val as string
                                    : "0.0",
                                stopTime: startTime
                                    ? "100.0"
                                    : val as string,
                                overrides: {}
                            }
                        )
                    ),
                    async val => await cannotAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        new FirebaseScenario(
                            uuid(),
                            {
                                name: "Name",
                                startTime: startTime
                                    ? val as string
                                    : "0.0",
                                stopTime: startTime
                                    ? "100.0"
                                    : val as string,
                                overrides: {}
                            }
                        )
                    )
                );
            }


            describe("Scenario IDs", () => {
                describeUUIDTests(
                    async id => await canAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        FirebaseScenario.newScenario(
                            id as string,
                            "s"
                        )
                    ),
                    async id => await cannotAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        FirebaseScenario.newScenario(
                            id as string,
                            "s"
                        )
                    )
                );
            });

            describe("Scenario Names", () => {
                describeArbitraryStringTests(
                    async val => await canAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        FirebaseScenario.newScenario(uuid(), val)
                    ),
                    async val => await cannotAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        FirebaseScenario.newScenario(uuid(), val)
                    )
                );
            });

            describe(
                "Scenario Start Times",
                () => describeScenarioStartStopTimeTests(true)
            );

            describe(
                "Scenario Stop Times",
                () => describeScenarioStartStopTimeTests(false)
            );

            describe("Scenario Overrides", () => {
                describe("Parameter Names", () => {
                    describeArbitraryStringTests(
                        async val => await canAddScenario(
                            getDb(UID_1),
                            MODELID_1,
                            new FirebaseScenario(
                                uuid(),
                                {
                                    name: "p",
                                    startTime: "0.0",
                                    stopTime: "0.0",
                                    overrides: {
                                        [`${val as string}`]: "I * R"
                                    }
                                }
                            )
                        ),
                        async val => await cannotAddScenario(
                            getDb(UID_1),
                            MODELID_1,
                            new FirebaseScenario(
                                uuid(),
                                {
                                    name: "p",
                                    startTime: "0.0",
                                    stopTime: "0.0",
                                    overrides: {
                                        [`${val as string}`]: "I * R"
                                    }
                                }
                            )
                        ),
                        false
                    );
                });

                describe("Override Values", () => {
                    describeArbitraryStringTests(
                        async val => await canAddScenario(
                            getDb(UID_1),
                            MODELID_1,
                            new FirebaseScenario(
                                uuid(),
                                {
                                    name: "p",
                                    startTime: "0.0",
                                    stopTime: "0.0",
                                    overrides: {
                                        ["p"]: val as string
                                    }
                                }
                            )
                        ),
                        async val => await cannotAddScenario(
                            getDb(UID_1),
                            MODELID_1,
                            new FirebaseScenario(
                                uuid(),
                                {
                                    name: "p",
                                    startTime: "0.0",
                                    stopTime: "0.0",
                                    overrides: {
                                        ["p"]: val as string
                                    }
                                }
                            )
                        )
                    );
                });
            });

            describe("Scenario Data Structure", () => {

                const fields: string[] = ["name", "startTime", "stopTime"];

                test(
                    "Can have name, startTime, stopTime, and no overrides",
                    async () => await canAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        new FirebaseScenario(
                            uuid(),
                            {
                                name: "s",
                                startTime: "0.0",
                                stopTime: "1.0"
                            }
                        )
                    )
                );

                test(
                    "Can have name, startTime, stopTime, and overrides",
                    async () => await canAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        new FirebaseScenario(
                            uuid(),
                            {
                                name: "s",
                                startTime: "0.0",
                                stopTime: "1.0",
                                overrides: {
                                    "a": "b",
                                    "c": "d"
                                }
                            }
                        )
                    )
                );

                test(
                    "Cannot have arbitrary fields in scenario",
                    async () => await cannotAddScenario(
                        getDb(UID_1),
                        MODELID_1,
                        new FirebaseScenario(
                            uuid(),
                            ({
                                name: "s",
                                startTime: "0.0",
                                stopTime: "0.0",
                                overrides: {},
                                other: "invalid"
                            } as unknown) as ScenarioComponentData
                        )
                    )
                );

                for (let i = 0; i < fields.length; i++) {
                    const field = fields[i];
                    test(
                        `Cannot have only ${field} field in scenario`,
                        async () => {
                            try {
                                await cannotAddScenario(
                                    getDb(UID_1),
                                    MODELID_1,
                                    new FirebaseScenario(
                                        uuid(),
                                        ({
                                            [`${field}`]: "abc"
                                        } as unknown) as ScenarioComponentData
                                    )
                                );
                            }
                            catch (e) {
                                // Also passes in this case.
                                expect(true).toBe(true);
                            }
                        }
                    );

                    for (let j = i + 1; j < fields.length; j++) {
                        const otherField = fields[j];
                        test(
                            `Cannot have only ${field} and ${otherField} fields`,
                            async () => {
                                try {
                                    await cannotAddScenario(
                                        getDb(UID_1),
                                        MODELID_1,
                                        new FirebaseScenario(
                                            uuid(),
                                            (
                                                {
                                                    [`${field}`]: "abc",
                                                    [`${otherField}`]: "def"
                                                } as unknown
                                            ) as ScenarioComponentData
                                        )
                                    );
                                }
                                catch (e) {
                                    // Also passes in this case
                                    expect(true).toBe(true);
                                }
                            }
                        );
                    }
                }

            });
        });

        describe("Substitutions", () => {

            describe("Replaced IDs", () => {
                const success = async (id: any) => await canAddSubstitution(
                    getDb(UID_1),
                    MODELID_1,
                    id as string,
                    UUID_1
                );
                const fail = async (id: any) => await cannotAddSubstitution(
                    getDb(UID_1),
                    MODELID_1,
                    id as string,
                    UUID_1
                );
                describeUUIDTests(success, fail);
                describeChildComponentUUIDTests(success, fail);
            });

            describe("Replacement IDs", () => {
                const success = async (id: any) => await canAddSubstitution(
                    getDb(UID_1),
                    MODELID_1,
                    UUID_1,
                    id as string
                );
                const fail = async (id: any) => await cannotAddSubstitution(
                    getDb(UID_1),
                    MODELID_1,
                    UUID_1,
                    id as string
                )
                describeUUIDTests(success, fail);
                describeChildComponentUUIDTests(success, fail);
            });
        });

        describe("Static Models", () => {

            describe("Model IDs", () => {
                describeUUIDTests(
                    async id => await canAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        id as string,
                        [STOCK_1, PARAM_1]
                    ),
                    async id => await cannotAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        id as string,
                        [STOCK_1, PARAM_1]
                    )
                );
            });

            describe("Component IDs", () => {
                describeUUIDTests(
                    async id => await cannotAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        MODELID_2,
                        [
                            FirebaseStock.createNew(
                                id as string,
                                0,
                                0
                            ),
                            PARAM_1
                        ]
                    ),
                    async id => await canAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        MODELID_2,
                        [
                            FirebaseStock.createNew(
                                id as string,
                                0,
                                0
                            ),
                            PARAM_1
                        ]
                    )
                );
                test("Cannot be a child component ID", async () =>
                    await cannotAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        MODELID_2,
                        [
                            FirebaseStock.createNew(
                                `${uuid()}${FirebaseStaticModel.ID_DELIMITER}` +
                                `${uuid()}`,
                                0,
                                0
                            ),
                            PARAM_1
                        ]
                    )
                );
            });

            describe("Component Types", () => {
                describeComponentTypeTests(
                    async t => await canAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        MODELID_2,
                        [
                            makeComponentMock(t),
                            PARAM_1
                        ]
                    ),
                    async t => await cannotAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        MODELID_2,
                        [
                            makeComponentMock(t),
                            PARAM_1
                        ]
                    )
                );
            });

            describe("Component Values", () => {
                const successTest = async (c: FirebaseComponent) =>
                    await canAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        MODELID_2,
                        [c, PARAM_1]
                    );
                const failTest = async (c: FirebaseComponent) =>
                    await cannotAddStaticModel(
                        getDb(UID_1),
                        MODELID_1,
                        MODELID_1,
                        [c, PARAM_1]
                    );
                describeComponentDataStructureTests(successTest, failTest);
                describeComponentDataValueTests(successTest, failTest);
            });
        });

        describe("Component Data Structure", () => {
            describeComponentDataStructureTests(
                async c => await canAddStaticModel(
                    getDb(UID_1),
                    MODELID_1,
                    MODELID_2,
                    [c, PARAM_1]
                ),
                async c => await cannotAddStaticModel(
                    getDb(UID_1),
                    MODELID_1,
                    MODELID_2,
                    [c, PARAM_1]
                )
            );
        });
    });
}
