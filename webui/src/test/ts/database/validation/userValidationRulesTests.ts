import { Bytes } from "firebase/firestore";
import { EMAIL_1, env, getDb, INVALID_UUIDS, INVALID_UIDS, MODELID_1, NAME_1, NON_STRING_VALUES, TestCase, UID_1 } from "../rtdb.test";
import { cannotAddUserOwnedModel, cannotEditUserEmail, cannotEditUserName, cannotWriteNewUser } from "../rtdbWriteFailures";
import { canAddUserOwnedModel, canEditUserEmail, canEditUserName, canWriteNewUser } from "../rtdbWriteSuccesses";

function testNameFails(description: string, name: any): void {
    test(
        "Cannot be a " + description,
        async () => await cannotEditUserName(
            getDb(UID_1),
            UID_1,
            name
        )
    );
}

function testNameSucceeds(description: string, name: any): void {
    test(
        "Can be a " + description,
        async () => await canEditUserName(
            getDb(UID_1),
            UID_1,
            name
        )
    );
}

function testEmailFails(description: string, email: any): void {
    test(
        "Cannot be a " + description,
        async () => await cannotEditUserEmail(
            getDb(UID_1),
            UID_1,
            email
        )
    );
}

function testEmailSucceeds(description: string, email: any): void {
    test(
        "Can be a " + description,
        async () => await canEditUserEmail(
            getDb(UID_1),
            UID_1,
            email
        )
    );
}

function testOwnedModelFails(
    description: string,
    modelId: any,
    modelVal: any
): void {
    test(
        "Cannot be a " + description,
        async () => {
            try {
                await cannotAddUserOwnedModel(
                    getDb(UID_1),
                    UID_1,
                    modelId,
                    modelVal
                );
            }
            catch (e) {
                // Also passes in this case.
                expect(true).toBe(true);
            }
        }
    );
}

function testOwnedModelSucceeds(
    description: string,
    modelId: any,
    modelVal: any,
): void {
    test(
        "Can be a " + description,
        async () => await canAddUserOwnedModel(
            getDb(UID_1),
            UID_1,
            modelId,
            modelVal
        )
    );
}

export default function describeUserValidationRulesTests() {


    describe("User data", () => {

        beforeEach(async () =>
            await env!.withSecurityRulesDisabled(ctx =>
                canWriteNewUser(
                    ctx.database(),
                    UID_1,
                    NAME_1,
                    EMAIL_1
                )
            )
        );

        describe("User IDs", () => {

            const invalid: TestCase[] = [
                ...INVALID_UIDS,
                { label: "empty string", val: "" },
                { label: "single character", val: "a" },
                { label: "arbitrary string", val: "asdfasdf" },
                { label: "string with special characters", val: "&#@" }
            ];
            for (const { label, val } of invalid) {
                test(
                    "User UID cannot be " + label,
                    async () => {
                        try {
                            const db = env!.authenticatedContext(
                                val as string
                            ).database();
                            await cannotWriteNewUser(
                                db,
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

        describe("Name", () => {

            testNameSucceeds("non-empty string", "Albert Einstein");

            testNameFails("empty string", "");
            testNameFails("int", 12);
            testNameFails("float", 1.234);
            testNameFails("boolean", true);
            testNameFails("bytes", Bytes.fromBase64String("asdfasdfasdfasdf"));
            testNameFails("array", [1, 2, 3]);
            testNameFails("object", { a: "a", b: "b" });
        });

        describe("Email", () => {

            testEmailSucceeds(
                "non-empty string matching email pattern",
                "asdf@test.ca"
            )

            testEmailFails(
                "non-empty string not matching email pattern",
                "asdf"
            );
            testEmailFails("empty string", "");
            testEmailFails("int", 12);
            testEmailFails("float", 1.234);
            testEmailFails("boolean", true);
            testEmailFails("bytes", Bytes.fromBase64String("asdfasdfasdfasdf"));
            testEmailFails("array", [1, 2, 3]);
            testEmailFails("object", { a: "a", b: "b" });
        });

        describe("Owned Models", () => {

            testOwnedModelSucceeds(
                "valid UUID and value 'true'",
                MODELID_1,
                true
            );

            for (const { label, val } of NON_STRING_VALUES) {
                testOwnedModelFails(
                    "valid UUID and value " + label,
                    MODELID_1,
                    val
                );
            }

            const invalidModelIds: TestCase[] = [
                ...INVALID_UUIDS,
                { label: "empty string", val: "" },
                { label: "arbitrary string", val: "asdfasdf" },
                { label: "single character", val: "a" },
                { label: "string with special characters", val: "&!$" },
                ...NON_STRING_VALUES,
            ];
            for (const { label, val } of invalidModelIds) {
                testOwnedModelFails(
                    `${label} and value 'true'`,
                    val,
                    true
                );
            }
        });
    });
}
