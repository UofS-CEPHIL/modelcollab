import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { ref, set } from "firebase/database";
import { Bytes } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import RTDBSchema, { Permission } from "../../../../main/ts/data/RTDBSchema";
import { EMAIL_1, EMAIL_2, env, getDb, MODELID_1, MODELNAME_1, NAME_1, NAME_2, TestCase, UID_1, UID_2, INVALID_UUIDS } from "../rtdb.test";
import { cannotShareModelInPermissions, cannotWritePublicModel } from "../rtdbWriteFailures";
import { canShareModelInPermissions, canWriteModelMetadata, canWriteNewUser, canWritePublicModel } from "../rtdbWriteSuccesses";

async function addModelWithId(id: string): Promise<void> {
    await env!.withSecurityRulesDisabled(
        async ctx => await canWriteModelMetadata(
            ctx.database(),
            id,
            "asdf",
            ModelType.StockFlow,
            UID_1
        )
    );
}

export default function describePermissionsValidationsTests(): void {

    describe("Permissions", () => {

        beforeEach(async () =>
            await env!.withSecurityRulesDisabled(async ctx => {
                const db = ctx.database();
                await canWriteModelMetadata(
                    db,
                    MODELID_1,
                    MODELNAME_1,
                    ModelType.CausalLoop,
                    UID_1
                );
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

        describe("Model ID", () => {
            const valid: TestCase[] = [
                { label: "valid uuid", val: uuid() }
            ];
            const invalid: TestCase[] = [
                ...INVALID_UUIDS,
                { label: "arbitrary string", val: "a string" },
                { label: "empty string", val: "" },
                { label: "int", val: 1 },
                { label: "float", val: 1.32 },
                { label: "array", val: [1, 2] },
                { label: "bytes", val: Bytes.fromBase64String("asdfasfd") },
                { label: "object", val: { a: "a", b: "b" } },
                { label: "boolean", val: false }

            ];

            for (const { label, val } of valid) {
                test(
                    "Shared model ID can be " + label,
                    async () => {
                        try {
                            await addModelWithId(val as string);
                        }
                        catch (e) {
                            fail();
                        }
                        await canShareModelInPermissions(
                            getDb(UID_1),
                            val as string,
                            UID_2
                        );

                    }
                );
                test("Public model ID can be " + label,
                    async () => {
                        try {
                            await addModelWithId(val as string);
                        }
                        catch (e) {
                            fail();
                        }
                        await canWritePublicModel(
                            getDb(UID_1),
                            val as string
                        );
                    });
            }
            for (const { label, val } of invalid) {
                test(
                    "Shared model ID cannot be " + label,
                    async () => {
                        try {
                            await addModelWithId(val as string);
                        }
                        catch (e) {
                            // Nothing.
                        }
                        try {
                            await cannotShareModelInPermissions(
                                getDb(UID_1),
                                val as string,
                                UID_2
                            );
                        }
                        catch (e) {
                            // Passes in this case
                            expect(true).toBe(true);
                        }
                    }
                );
                test(
                    "Public model ID cannot be " + label,
                    async () => {
                        try {
                            await addModelWithId(val as string);
                        }
                        catch (e) {
                            // Nothing.
                        }
                        try {
                            await cannotWritePublicModel(
                                getDb(UID_1),
                                val as string
                            );
                        }
                        catch (e) {
                            // Passes in this case
                            expect(true).toBe(true);
                        }
                    }
                );
            }
        });

        describe("User IDs", () => {

            const valid: TestCase[] = [
                { label: "valid uid", val: "Xn7vZpQ9LmRfTcHjKwY3bGsNxA1e" }
            ];
            const invalid: TestCase[] = [
                {
                    label: "uid with invalid character",
                    val: "!n7vZpQ9LmRfTcHjKwY3bGsNxA1e"
                },
                {
                    label: "uid with wrong length",
                    val: "Xn7vZpQ9LmRfTcHjKwY3bGsNxA1ea"
                },
                {
                    label: "arbitrary string",
                    val: "a string"
                },
                { label: "empty string", val: "" },
                { label: "int", val: 1 },
                { label: "float", val: 1.32 },
                { label: "array", val: [1, 2] },
                {
                    label: "bytes",
                    val: Bytes.fromBase64String("asdfasfd")
                },
                { label: "object", val: { a: "a", b: "b" } },
                { label: "boolean", val: true },
            ];

            for (const { label, val } of valid) {
                test(
                    "UID in permissions can be " + label,
                    async () => {
                        await env!.withSecurityRulesDisabled(async ctx =>
                            await canWriteNewUser(
                                ctx.database(),
                                val as string
                            )
                        );
                        await canShareModelInPermissions(
                            getDb(UID_1),
                            MODELID_1,
                            val as string
                        );
                    }
                );
            }
            for (const { label, val } of invalid) {
                test(
                    "UID in permissions cannot be " + label,
                    async () => {
                        try {
                            await env!.withSecurityRulesDisabled(async ctx =>
                                await canWriteNewUser(
                                    ctx.database(),
                                    val as string
                                )
                            );
                        }
                        catch (e) {
                            // Nothing.
                        }
                        try {
                            await cannotShareModelInPermissions(
                                getDb(UID_1),
                                MODELID_1,
                                val as string
                            );
                        }
                        catch (e) {
                            // Also passes in this case
                            expect(true).toBe(true);
                        }
                    }
                );
            }
        });

        describe("Shared model values", () => {

            const valid = [
                { label: "true", val: true }
            ];
            const invalid = [
                { label: "false", val: false },
                { label: "string", val: "asdf" },
                { label: "int", val: 1 },
                { label: "float", val: 1.32 },
                { label: "array", val: [1, 2] },
                { label: "object", val: { a: "a", b: "b" } },
            ];

            for (const { label, val } of valid) {
                test(
                    "Shared model value can be " + label,
                    async () => await assertSucceeds(
                        set(
                            ref(
                                getDb(UID_1),
                                RTDBSchema.ModelPermissions.makeSharedModelPath(
                                    UID_2,
                                    MODELID_1
                                )
                            ),
                            val
                        )
                    )
                );
            }
            for (const { label, val } of invalid) {
                test(
                    "Shared model value cannot be " + label,
                    async () => {
                        try {
                            await assertFails(
                                set(
                                    ref(
                                        getDb(UID_1),
                                        RTDBSchema.ModelPermissions
                                            .makeSharedModelPath(
                                                UID_2,
                                                MODELID_1
                                            )
                                    ),
                                    val
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
        });

        describe("Public model values", () => {
            const valid: TestCase[] = [
                { label: "read-only", val: Permission.READ },
                { label: "read/write", val: Permission.READWRITE }
            ];
            const invalid: TestCase[] = [
                { label: "arbitrary string", val: "a string []" },
                { label: "empty string", val: "" },
                { label: "int", val: 1 },
                { label: "float", val: 1.32 },
                { label: "array", val: [1, 2] },
                { label: "bytes", val: Bytes.fromBase64String("asdfasfd") },
                { label: "object", val: { a: "a", b: "b" } },
                { label: "boolean", val: false }
            ];

            for (const { label, val } of valid) {
                test(
                    "Public model value can be " + label,
                    async () => await assertSucceeds(
                        set(
                            ref(
                                getDb(UID_1),
                                RTDBSchema.ModelPermissions.makePublicModelPath(
                                    MODELID_1
                                )
                            ),
                            val
                        )
                    )
                );
            }
            for (const { label, val } of invalid) {
                test(
                    "Public model value cannot be " + label,
                    async () => await assertFails(
                        set(
                            ref(
                                getDb(UID_1),
                                RTDBSchema.ModelPermissions.makePublicModelPath(
                                    MODELID_1
                                )
                            ),
                            val
                        )
                    )
                );
            }
        });

    });

}
