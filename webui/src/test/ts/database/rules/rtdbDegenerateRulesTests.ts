import { getDb, UID_UNAUTHENTICATED, UID_1, env, NAME_1, EMAIL_1, UID_2, NAME_2, EMAIL_2, UID_3, NAME_3, EMAIL_3, MODELID_1, MODELNAME_1, MODELID_2, MODELNAME_2 } from "../rtdb.test";
import { cannotReadUnexpectedLocations } from "../rtdbReadFailures";
import { cannotWriteUnexpectedLocations } from "../rtdbWriteFailures";
import { assertFails } from "@firebase/rules-unit-testing";
import { ref, remove } from "firebase/database";
import { canShareModelInPermissions, canWriteModelMetadata, canWriteNewUser, canWritePublicModel } from "../rtdbWriteSuccesses";
import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import { setupModelComponents } from "./rtdbModelDataRulesTests";

export default function describeDegenerateRulesTests(): void {
    describe("Degenerate test cases", () => {

        function noUnexpectedPathsPermissions(
            userUid: string
        ): (() => void) {
            return () => {
                describe("Unexpected paths", () => {
                    test(
                        "Not permitted to read from unexpected paths",
                        async () => await cannotReadUnexpectedLocations(
                            getDb(userUid)
                        )
                    );

                    test(
                        "Not permitted to write to unexpected paths",
                        async () => await cannotWriteUnexpectedLocations(
                            getDb(userUid)
                        )
                    );
                });
            }
        }

        function entireDatabaseTests(
            userUid: string
        ): (() => void) {
            return () => {
                describe("Entire database", () => {

                    beforeEach(async () =>
                        env!.withSecurityRulesDisabled(async ctx => {
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
                            await canWriteNewUser(
                                db,
                                UID_3,
                                NAME_3,
                                EMAIL_3
                            );
                            await canWriteModelMetadata(
                                db,
                                MODELID_1,
                                MODELNAME_1,
                                ModelType.StockFlow,
                                UID_1
                            );
                            await canWriteModelMetadata(
                                db,
                                MODELID_2,
                                MODELNAME_2,
                                ModelType.StockFlow,
                                UID_1
                            );
                            await canShareModelInPermissions(
                                db,
                                MODELID_2,
                                UID_2
                            );
                            await canWritePublicModel(
                                db,
                                MODELID_1
                            );

                            await setupModelComponents(
                                db,
                                MODELID_2
                            );
                        })
                    );

                    test(
                        "Not permitted to delete the entire database",
                        async () => await assertFails(
                            remove(
                                ref(
                                    getDb(userUid),
                                    "/"
                                )
                            )
                        )
                    );
                });
            }
        }

        describe(
            "Unauthenticated User",
            () => {
                noUnexpectedPathsPermissions(UID_UNAUTHENTICATED)();
                entireDatabaseTests(UID_UNAUTHENTICATED)();
            }
        );


        describe(
            "Authenticated User",
            () => {
                noUnexpectedPathsPermissions(UID_1)();
                entireDatabaseTests(UID_1)();
            }
        );
    });
}
