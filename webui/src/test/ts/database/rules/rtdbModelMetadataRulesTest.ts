import { v4 as uuid } from "uuid";
import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import { Permission } from "../../../../main/ts/data/RTDBSchema";
import { cannotReadModelName, cannotReadModelOwner, cannotReadModelSharedUser, cannotReadModelType } from "./rtdbReadFailures";
import { canReadModelName, canReadModelOwner, canReadModelSharedUser, canReadModelSharedUsers, canReadModelType } from "./rtdbReadSuccesses";

import { EMAIL_1, EMAIL_2, EMAIL_3, MODELID_1, MODELNAME_1, NAME_1, NAME_2, NAME_3, UID_1, UID_2, UID_3, getDb, UID_UNAUTHENTICATED, Database, env } from "./rtdbRules.test";
import { cannotAddModelSharedUserToMetadata, cannotEditModelSharedUserInMetadata, cannotRemoveAllModelMetadata, cannotRemoveModelMetadata, cannotRemoveModelName, cannotRemoveModelOwner, cannotRemoveModelSharedUserFromMetadata, cannotRemoveModelSharedUsersFromMetadata, cannotRemoveModelType, cannotWriteModelName, cannotWriteModelOwner, cannotWriteModelType, cannotWriteNewModelMetadata } from "./rtdbWriteFailures";
import { canAddModelSharedUserToMetadata, canEditModelSharedUserInMetadata, canRemoveModelMetadata, canRemoveModelSharedUserFromMetadata, canShareModelInPermissions, canWriteModelMetadata, canWriteModelName, canWritePublicModel } from "./rtdbWriteSuccesses";
import { canWriteNewUser } from "./rtdbWriteSuccesses";

export default function describeModelMetadataRulesTests(): void {

    describe("Model metadata", () => {

        beforeEach(async () => {
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
                await canWriteNewUser(
                    db,
                    UID_3,
                    NAME_3,
                    EMAIL_3
                );
            });
        });

        describe("Non-existent model", () => {
            test(
                "User permitted to create metadata for a new model " +
                "for themselves",
                async () => await canWriteModelMetadata(
                    getDb(UID_1),
                    uuid(),
                    "mymodel2",
                    ModelType.StockFlow,
                    UID_1,
                )
            );

            test(
                "User not permitted to create metadata for a new model " +
                "for another user",
                async () => await cannotWriteNewModelMetadata(
                    getDb(UID_1),
                    uuid(),
                    "mymodel2",
                    ModelType.StockFlow,
                    UID_2
                )
            );

            function nonExistentModelTests(
                label: string,
                userUid: string
            ): void {
                test(
                    label + " not permitted to read non-existent model name",
                    async () => await cannotReadModelName(
                        getDb(userUid),
                        uuid()
                    )
                );
                test(
                    label + " not permitted to read non-existent model owner",
                    async () => await cannotReadModelOwner(
                        getDb(userUid),
                        uuid()
                    )
                );
                test(
                    label + " not permitted to read non-existent model type",
                    async () => await cannotReadModelType(
                        getDb(userUid),
                        uuid()
                    )
                );
                test(
                    label + " not permitted to write a new model name alone",
                    async () => await cannotWriteModelName(
                        getDb(userUid),
                        uuid()
                    )
                );
                test(
                    label + " not permitted to write a new model type alone",
                    async () => await cannotWriteModelType(
                        getDb(userUid),
                        uuid()
                    )
                );
                test(
                    label + " not permitted to write a new model owner alone",
                    async () => await cannotWriteModelOwner(
                        getDb(userUid),
                        uuid(),
                        UID_3
                    )
                );
            }

            nonExistentModelTests(
                "User",
                UID_1
            );
            nonExistentModelTests(
                "Unauthenticated User",
                UID_UNAUTHENTICATED
            );

            test(
                "Unauthenticated user not permitted to create a model",
                async () => await cannotWriteNewModelMetadata(
                    getDb(UID_UNAUTHENTICATED),
                    MODELID_1,
                    MODELNAME_1,
                    ModelType.CausalLoop,
                    UID_1
                )
            );
        });

        describe("Owner", () => {

            beforeEach(async () => await env!.withSecurityRulesDisabled(
                async ctx => await canWriteModelMetadata(
                    ctx.database(),
                    MODELID_1,
                    MODELNAME_1,
                    ModelType.StockFlow,
                    UID_1
                )
            ));

            test(
                "Permitted to read owner UID",
                async () => await canReadModelOwner(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Not permitted to write owner UID",
                async () => await cannotWriteModelOwner(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Permitted to edit model name",
                async () => await canWriteModelName(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Permitted to read model name",
                async () => await canReadModelName(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Permitted to read model type",
                async () => await canReadModelType(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Not permitted to edit model type",
                async () => await cannotWriteModelType(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Permitted to add other users to shared list",
                async () => await canAddModelSharedUserToMetadata(
                    getDb(UID_1),
                    MODELID_1,
                    UID_2,
                )
            );

            test(
                "Not permitted to add self to shared list",
                async () => await cannotAddModelSharedUserToMetadata(
                    getDb(UID_1),
                    MODELID_1,
                    UID_1
                )
            );

            test(
                "Permitted to delete model metadata",
                async () => await canRemoveModelMetadata(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Not permitted to remove model name alone",
                async () => await cannotRemoveModelName(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Not permitted to remove model type alone",
                async () => await cannotRemoveModelType(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Not permitted to remove model owner alone",
                async () => await cannotRemoveModelOwner(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "Not permitted to delete entire model metadata list",
                async () => await cannotRemoveAllModelMetadata(
                    getDb(UID_1)
                )
            );

            describe("Interaction with other users", () => {

                beforeEach(async () => await env!.withSecurityRulesDisabled(
                    async ctx => canAddModelSharedUserToMetadata(
                        ctx.database(),
                        MODELID_1,
                        UID_2
                    )
                ));

                test(
                    "Permitted to edit users permission levels",
                    async () => await canEditModelSharedUserInMetadata(
                        getDb(UID_1),
                        MODELID_1,
                        UID_2
                    )
                );

                test(
                    "Permitted to remove shared user",
                    async () => await canRemoveModelSharedUserFromMetadata(
                        getDb(UID_1),
                        MODELID_1,
                        UID_2
                    )
                );

                test(
                    "Permitted to read shared user",
                    async () => await canReadModelSharedUser(
                        getDb(UID_1),
                        MODELID_1,
                        UID_2
                    )
                );

                test(
                    "Permitted to read shared users",
                    async () => await canReadModelSharedUsers(
                        getDb(UID_1),
                        MODELID_1
                    )
                );
            });
        });

        function noPrivilegedPermissionsTests(
            userUid: string,
            userPermission?: Permission,
            modelVisibility?: Permission
        ): void {


            let db: Database | null = null;

            beforeEach(async () => {
                db = getDb(userUid);
                await env!.withSecurityRulesDisabled(async ctx => {
                    const db = ctx.database();
                    await canWriteModelMetadata(
                        db,
                        MODELID_1,
                        MODELNAME_1,
                        ModelType.StockFlow,
                        UID_1
                    );
                    if (userPermission) {
                        await canShareModelInPermissions(
                            db,
                            MODELID_1,
                            userUid
                        );
                        await canAddModelSharedUserToMetadata(
                            db,
                            MODELID_1,
                            userUid,
                            userPermission
                        )
                    }
                    if (modelVisibility) {
                        await canWritePublicModel(
                            db,
                            MODELID_1,
                            modelVisibility
                        )
                    }
                });
            });

            test(
                "Not permitted to edit model name",
                async () => await cannotWriteModelName(
                    db!,
                    MODELID_1
                )
            );

            test(
                "Not permitted to remove model name",
                async () => await cannotRemoveModelName(
                    db!,
                    MODELID_1
                )
            );

            test(
                "Not permitted to edit model owner",
                async () => await cannotWriteModelOwner(
                    db!,
                    MODELID_1,
                )
            );

            test(
                "Not permitted to remove model owner",
                async () => await cannotRemoveModelOwner(
                    db!,
                    MODELID_1
                )
            );

            test(
                "Not permitted to edit model type",
                async () => await cannotWriteModelType(
                    db!,
                    MODELID_1,
                )
            );

            test(
                "Not permitted to remove model type",
                async () => await cannotRemoveModelType(
                    db!,
                    MODELID_1
                )
            );

            test(
                "Not permitted to add model owner to shared list",
                async () => await cannotAddModelSharedUserToMetadata(
                    db!,
                    MODELID_1,
                    UID_1
                )
            );

            test(
                "Not permitted to add other user to shared list",
                async () => await cannotAddModelSharedUserToMetadata(
                    db!,
                    MODELID_1,
                    UID_3
                )
            );

            test(
                "Not permitted to add non-existent user to shared list",
                async () => await cannotAddModelSharedUserToMetadata(
                    db!,
                    MODELID_1,
                    uuid()
                )
            );

            test(
                "Not permitted to delete model",
                async () => await cannotRemoveModelMetadata(
                    db!,
                    MODELID_1
                )
            );

            test(
                "Not permitted to replace model with another one",
                async () => await cannotWriteNewModelMetadata(
                    db!,
                    MODELID_1,
                    "new name",
                    ModelType.StockFlow,
                    UID_3
                )
            );

            test(
                "Not permitted to delete entire model metadata list",
                async () => await cannotRemoveAllModelMetadata(
                    db!
                )
            );

            if (userPermission) {
                test(
                    "Not permitted to remove self from shared list",
                    async () =>
                        await cannotRemoveModelSharedUserFromMetadata(
                            db!,
                            MODELID_1,
                            userUid
                        )
                );
                test(
                    "Not permitted to edit own permissions",
                    async () => await cannotEditModelSharedUserInMetadata(
                        db!,
                        MODELID_1,
                        userUid,
                        userPermission === Permission.READ
                            ? Permission.READWRITE
                            : Permission.READ
                    )
                );
            }
            else {
                test(
                    "Not permitted to add self to shared list",
                    async () => await cannotAddModelSharedUserToMetadata(
                        db!,
                        MODELID_1,
                        userUid
                    )
                );
            }

            if (
                userPermission
                || (modelVisibility && userUid !== UID_UNAUTHENTICATED)
            ) {
                test(
                    "Permitted to read model name",
                    async () => await canReadModelName(
                        db!,
                        MODELID_1
                    )
                );
                test(
                    "Permitted to read model owner",
                    async () => await canReadModelOwner(
                        db!,
                        MODELID_1
                    )
                );
                test(
                    "Permitted to read model type",
                    async () => await canReadModelType(
                        db!,
                        MODELID_1
                    )
                );
            }
            else {
                test(
                    "Not permitted to read model name",
                    async () => await cannotReadModelName(
                        db!,
                        MODELID_1
                    )
                );
                test(
                    "Not permitted to read model owner",
                    async () => await cannotReadModelOwner(
                        db!,
                        MODELID_1
                    )
                );
                test(
                    "Not premitted to read model type",
                    async () => await cannotReadModelType(
                        db!,
                        MODELID_1
                    )
                );
            }

            describe("Interaction With Other Users", () => {

                beforeEach(async () =>
                    await env!.withSecurityRulesDisabled(async ctx =>
                        await canAddModelSharedUserToMetadata(
                            ctx.database(),
                            MODELID_1,
                            UID_3
                        )
                    )
                );

                test(
                    "Not permitted to read user permissions",
                    async () => await cannotReadModelSharedUser(
                        db!,
                        MODELID_1,
                        UID_3
                    )
                );

                test(
                    "Not permitted to edit user permissions",
                    async () => await cannotEditModelSharedUserInMetadata(
                        db!,
                        MODELID_1,
                        UID_3,
                        Permission.READ
                    )
                );

                test(
                    "Not permitted to remove other user from shared list",
                    async () =>
                        await cannotRemoveModelSharedUserFromMetadata(
                            db!,
                            MODELID_1,
                            UID_3
                        )
                );

                test(
                    "Not permitted to remove entire shared list",
                    async () => {
                        await env!.withSecurityRulesDisabled(async ctx => {
                            const db = ctx.database();
                            await canAddModelSharedUserToMetadata(
                                db,
                                MODELID_1,
                                uuid()
                            );
                        });
                        await cannotRemoveModelSharedUsersFromMetadata(
                            db!,
                            MODELID_1
                        );
                    }
                );
            });
        }

        function testUserPermissionsWithAllModelVisibilities(
            userUid: string,
            userPermission?: Permission
        ): void {
            describe(
                "Private Model",
                () => noPrivilegedPermissionsTests(
                    userUid,
                    userPermission
                )
            );

            describe(
                "Read/Write Public Model",
                () => noPrivilegedPermissionsTests(
                    userUid,
                    userPermission,
                    Permission.READWRITE
                )
            );

            describe(
                "Read-Only Public Model",
                () => noPrivilegedPermissionsTests(
                    userUid,
                    userPermission,
                    Permission.READ
                )
            );
        }

        describe("Read/Write Shared User", () =>
            testUserPermissionsWithAllModelVisibilities(
                UID_2,
                Permission.READWRITE
            )
        );

        describe("Read-Only Shared User", () =>
            testUserPermissionsWithAllModelVisibilities(
                UID_2,
                Permission.READ
            )
        );

        describe("Non-Shared User", () =>
            testUserPermissionsWithAllModelVisibilities(
                UID_2
            )
        );

        describe("Unauthenticated user", () =>
            testUserPermissionsWithAllModelVisibilities(
                UID_UNAUTHENTICATED
            )
        );
    });
}
