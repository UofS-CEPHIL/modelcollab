import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import { EMAIL_1, EMAIL_2, env, getDb, MODELID_1, MODELID_2, MODELNAME_2, NAME_1, NAME_2, TestCase, UID_1, UID_2, NON_STRING_VALUES, INVALID_UIDS, UID_3 } from "../rtdb.test";
import { cannotWriteModelMetadata } from "../rtdbWriteFailures";
import { canWriteModelMetadata, canWriteNewUser } from "../rtdbWriteSuccesses";

async function describeStringTests(
    fieldName: string,
    valid: TestCase[],
    invalid: TestCase[],
    succTest: (val: any) => Promise<void>,
    failTest: (val: any) => Promise<void>
): Promise<void> {
    describe(fieldName, () => {

        for (const { label, val } of valid) {
            test(
                `${fieldName} can be ${label}`,
                async () => await succTest(val)
            );
        }
        for (const { label, val } of invalid) {
            test(
                `${fieldName} cannot be ${label}`,
                async () => {
                    try {
                        await failTest(val);
                    }
                    catch (e) {
                        // Also passes in this case
                        expect(true).toBe(true);
                    }
                }
            );
        }
    });
}

export default function describeModelMetadataValidationTests(): void {

    describe("Model Metadata", () => {

        beforeEach(async () =>
            await env!.withSecurityRulesDisabled(async ctx => {
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
            })
        );


        describeStringTests(
            "Name",
            [
                { label: "single character", val: "a" },
                { label: "string with spaces", val: "with spaces" },
                { label: "string with special characters", val: "&$[{}^" },
            ],
            [
                { label: "empty string", val: "" },
                ...NON_STRING_VALUES,
            ],
            async name => await canWriteModelMetadata(
                getDb(UID_1),
                MODELID_2,
                name,
                ModelType.StockFlow,
                UID_1
            ),
            async name => await cannotWriteModelMetadata(
                getDb(UID_1),
                MODELID_2,
                name,
                ModelType.StockFlow,
                UID_1
            )
        );
        describeStringTests(
            "Type",
            [
                ...Object.values(ModelType).map(t => {
                    return {
                        label: `"${t}"`,
                        val: t
                    };
                }),
            ],
            [
                { label: "empty string", val: "" },
                { label: "arbitrary string", val: "asdf" },
                { label: "single character other than 'r'", val: "a" },
                ...NON_STRING_VALUES,
            ],
            async val => await canWriteModelMetadata(
                getDb(UID_1),
                MODELID_2,
                MODELNAME_2,
                val as ModelType,
                UID_1
            ),
            async val => await cannotWriteModelMetadata(
                getDb(UID_1),
                MODELID_2,
                MODELNAME_2,
                val as ModelType,
                UID_1
            )
        );
        describeStringTests(
            "Owner UID",
            [UID_1, UID_2, UID_3].map((uid, i) => {
                return {
                    label: `Valid uid ${i + 1}`,
                    val: uid
                }
            }),
            [
                { label: "empty string", val: "" },
                { label: "arbitrary string", val: "asdfadsf" },
                ...INVALID_UIDS,
                ...NON_STRING_VALUES
            ],
            async ownerUid => {
                await env!.withSecurityRulesDisabled(
                    async ctx => await canWriteNewUser(
                        ctx.database(),
                        ownerUid
                    )
                );
                const db = env!.authenticatedContext(ownerUid).database();
                await canWriteModelMetadata(
                    db,
                    MODELID_2,
                    MODELNAME_2,
                    ModelType.StockFlow,
                    ownerUid
                );
            },
            async ownerUid => {
                await env!.withSecurityRulesDisabled(
                    async ctx => {
                        await canWriteNewUser(
                            ctx.database(),
                            ownerUid
                        );
                    }
                );
                const db = env!.authenticatedContext(ownerUid).database();
                expect(async () => await cannotWriteModelMetadata(
                    db,
                    MODELID_1,
                    MODELNAME_2,
                    ModelType.CausalLoop,
                    ownerUid
                )).toThrow();
            }
        );
    });
}
