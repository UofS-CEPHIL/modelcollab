import { assertFails } from "@firebase/rules-unit-testing";
import { ref, remove } from "firebase/database";
import { v4 as uuid } from "uuid";
import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import RTDBSchema, { Permission } from "../../../../main/ts/data/RTDBSchema";
import { cannotReadModelSharedUser, cannotReadModelSharedUsers, cannotReadPublicModels, cannotReadUserSharedModel, cannotReadUserSharedModels } from "../rtdbReadFailures";
import { canReadModelSharedUser, canReadModelSharedUsers, canReadPublicModels, canReadUserSharedModel, canReadUserSharedModels } from "../rtdbReadSuccesses";
import { getDb, UID_1, UID_2, UID_3, MODELID_1, UID_UNAUTHENTICATED, MODELNAME_1, NAME_1, NAME_2, NAME_3, EMAIL_1, EMAIL_2, EMAIL_3, MODELID_2, MODELNAME_2, env } from "../rtdb.test";
import { cannotAddModelSharedUserToModelPermissions, cannotEditModelSharedUserInModelPermissions, cannotRemoveEntireModelsSharedUsersList, cannotRemoveEntirePublicModelsList, cannotRemoveEntireSharedModelListInPermissions, cannotRemoveEntireUsersSharedModelsList, cannotRemoveModelSharedUserFromModelPermissions, cannotRemoveModelSharedUsersFromModelPermissions, cannotRemovePublicModel, cannotRemoveSharedModelInPermissions, cannotShareModelInPermissions, cannotWritePublicModel } from "../rtdbWriteFailures";
import { canAddModelSharedUserToModelPermissions, canEditModelSharedUserInModelPermissions, canRemoveModelSharedUserFromModelPermissions, canRemovePublicModel, canRemoveSharedModelInPermissions, canAddModelToUserSharedList, canWriteModelMetadata, canWriteNewUser, canWritePublicModel } from "../rtdbWriteSuccesses";


async function shareModelWithUser(
    modelId: string,
    userUid: string
): Promise<void> {
    await env!.withSecurityRulesDisabled(async ctx => {
        const db = ctx.database();
        await canAddModelSharedUserToModelPermissions(
            db,
            modelId,
            userUid
        );
        await canAddModelToUserSharedList(
            db,
            modelId,
            userUid
        )
    });
}

export default function describeModelPermissionsRulesTests(): void {
    describe("Model permissions", () => {

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
                await canWritePublicModel(
                    db,
                    MODELID_1,
                    Permission.READWRITE
                );
            });
        });

        for (const permission of [Permission.READ, Permission.READWRITE]) {

            describe(`${permission} shared user`, () => {

                beforeEach(async () =>
                    await shareModelWithUser(MODELID_2, UID_2)
                );

                test(
                    "Not permitted to add model owner to shared list",
                    async () =>
                        await cannotAddModelSharedUserToModelPermissions(
                            getDb(UID_2),
                            MODELID_2,
                            UID_1
                        )
                );

                test(
                    "Not permitted to remove self from model shared list",
                    async () =>
                        await cannotRemoveModelSharedUserFromModelPermissions(
                            getDb(UID_2),
                            MODELID_2,
                            UID_2
                        )
                );

                test(
                    "Not permitted to add other user to shared list",
                    async () =>
                        await cannotAddModelSharedUserToModelPermissions(
                            getDb(UID_2),
                            MODELID_2,
                            UID_3
                        )
                );

                test(
                    "Not permitted to add non-existent user to shared list",
                    async () =>
                        await cannotAddModelSharedUserToModelPermissions(
                            getDb(UID_2),
                            MODELID_2,
                            uuid()
                        )
                );

                test(
                    "Not permitted to edit own permissions",
                    async () =>
                        await cannotEditModelSharedUserInModelPermissions(
                            getDb(UID_2),
                            MODELID_2,
                            UID_2,
                            permission === Permission.READWRITE
                                ? Permission.READ
                                : Permission.READWRITE
                        )
                );

                test(
                    "Not permitted to read other model shared user",
                    async () => {
                        await shareModelWithUser(MODELID_2, UID_3);
                        await cannotReadModelSharedUser(
                            getDb(UID_2),
                            MODELID_2,
                            UID_3
                        );
                    }
                );

                test(
                    "Not permitted to read entire shared list",
                    async () => {
                        await shareModelWithUser(MODELID_2, UID_3);
                        await cannotReadModelSharedUsers(
                            getDb(UID_2),
                            MODELID_2
                        );
                    }
                );

                test(
                    "Not permitted to delete entire model shared users list",
                    async () =>
                        await cannotRemoveModelSharedUsersFromModelPermissions(
                            getDb(UID_2),
                            MODELID_2
                        )
                );
            });
        }

        describe("Model owner", () => {

            beforeEach(async () =>
                await env!.withSecurityRulesDisabled(
                    async ctx => {
                        const db = ctx.database();
                        await canAddModelToUserSharedList(
                            db,
                            MODELID_2,
                            UID_2
                        );
                        await canAddModelSharedUserToModelPermissions(
                            db,
                            MODELID_2,
                            UID_2
                        );
                    }
                )
            );

            test(
                "Permitted to add other users to shared list",
                async () => await canAddModelSharedUserToModelPermissions(
                    getDb(UID_1),
                    MODELID_2,
                    UID_3,
                )
            );

            test(
                "Permitted to add model to other user's shared list",
                async () => await canAddModelToUserSharedList(
                    getDb(UID_1),
                    MODELID_2,
                    UID_2
                )
            );

            test(
                "Not permitted to add self to model shared list",
                async () => await cannotAddModelSharedUserToModelPermissions(
                    getDb(UID_1),
                    MODELID_2,
                    UID_1
                )
            );

            test(
                "Permitted to edit users permission levels",
                async () =>
                    await canEditModelSharedUserInModelPermissions(
                        getDb(UID_1),
                        MODELID_2,
                        UID_2
                    )
            );

            test(
                "Permitted to remove shared user from model permissions",
                async () =>
                    await canRemoveModelSharedUserFromModelPermissions(
                        getDb(UID_1),
                        MODELID_2,
                        UID_2
                    )
            );

            test(
                "Permitted to remove model from shared user's list",
                async () => await canRemoveSharedModelInPermissions(
                    getDb(UID_1),
                    MODELID_2,
                    UID_2
                )
            );

            test(
                "Permitted to read shared user",
                async () => await canReadModelSharedUser(
                    getDb(UID_1),
                    MODELID_2,
                    UID_2
                )
            );

            test(
                "Permitted to read shared users",
                async () => await canReadModelSharedUsers(
                    getDb(UID_1),
                    MODELID_2
                )
            );
        });

        describe("Generic User", () => {
            test(
                "Not permitted to delete entire models shared users list",
                async () => {
                    await shareModelWithUser(MODELID_1, UID_2);
                    await shareModelWithUser(MODELID_1, UID_3);
                    await shareModelWithUser(MODELID_2, UID_3);
                    await cannotRemoveEntireModelsSharedUsersList(
                        getDb(UID_2)
                    );
                }
            );

            test(
                "Not permitted to delete entire user shared models list",
                async () => {
                    await shareModelWithUser(MODELID_1, UID_2);
                    await shareModelWithUser(MODELID_1, UID_3);
                    await shareModelWithUser(MODELID_2, UID_3);
                    await cannotRemoveEntireUsersSharedModelsList(
                        getDb(UID_2)
                    );
                }
            );

            test(
                "Not permitted to delete the whole public models list",
                async () => await assertFails(
                    remove(
                        ref(
                            getDb(UID_2),
                            RTDBSchema.ModelPermissions.makePath()
                        )
                    )
                )
            );

            test(
                "Not permitted to add a non-existent model to " +
                "others' shared list",
                async () => await cannotShareModelInPermissions(
                    getDb(UID_1),
                    uuid(),
                    UID_2
                )
            );

            test(
                "User not permitted to add self to model shared list",
                async () => await cannotAddModelSharedUserToModelPermissions(
                    getDb(UID_3),
                    MODELID_1,
                    UID_3
                )
            );

            test(
                "User not permitted to add other user to model shared list",
                async () => await cannotAddModelSharedUserToModelPermissions(
                    getDb(UID_2),
                    MODELID_1,
                    UID_3
                )
            );

            test(
                "User not permitted to add non-existent model to " +
                "own shared list",
                async () => await cannotShareModelInPermissions(
                    getDb(UID_2),
                    uuid(),
                    UID_2
                )
            );

            test(
                "User not permitted to add other user's model to " +
                "own shared list",
                async () => await cannotShareModelInPermissions(
                    getDb(UID_2),
                    MODELID_1,
                    UID_2
                )
            );

            test(
                "User not permitted to remove model from their own shared list",
                async () => await cannotRemoveSharedModelInPermissions(
                    getDb(UID_2),
                    MODELID_2,
                    UID_2
                )
            );

            test(
                "User not permitted to remove someone else's model " +
                "from other user's shared list",
                async () => await cannotRemoveSharedModelInPermissions(
                    getDb(UID_3),
                    MODELID_2,
                    UID_2
                )
            );

            test(
                "User not permitted to add own model to own shared list",
                async () => await cannotShareModelInPermissions(
                    getDb(UID_1),
                    MODELID_1,
                    UID_1
                )
            );

            test(
                "User not permitted to add someone else's model to " +
                "others' shared list",
                async () => await cannotShareModelInPermissions(
                    getDb(UID_3),
                    MODELID_1,
                    UID_2
                )
            );

            test(
                "User not permitted to add own model to non-existent " +
                "user's shared list",
                async () => await cannotShareModelInPermissions(
                    getDb(UID_1),
                    MODELID_1,
                    uuid()
                )
            );

            test(
                "User permitted to read own shared models",
                async () => await canReadUserSharedModels(
                    getDb(UID_2),
                    UID_2
                )
            );

            test(
                "User permitted to read own shared model",
                async () => await canReadUserSharedModel(
                    getDb(UID_2),
                    UID_2,
                    MODELID_2
                )
            );

            test(
                "User not permitted to read others' shared models",
                async () => await cannotReadUserSharedModels(
                    getDb(UID_1),
                    UID_2
                )
            );

            test(
                "User not permitted to read others' shared model",
                async () => await cannotReadUserSharedModel(
                    getDb(UID_1),
                    UID_2,
                    MODELID_2
                )
            );

            test(
                "User permitted to set their own model to public",
                async () => await canWritePublicModel(
                    getDb(UID_1),
                    MODELID_2
                )
            );

            test(
                "User permitted to read public models list",
                async () => await canReadPublicModels(
                    getDb(UID_2)
                )
            );

            test(
                "User permitted edit their model's permissions",
                async () => await canWritePublicModel(
                    getDb(UID_1),
                    MODELID_1,
                    Permission.READ
                )
            );

            test(
                "User permitted to remove their model from the public list",
                async () => await canRemovePublicModel(
                    getDb(UID_1),
                    MODELID_1
                )
            );

            test(
                "User not permitted to set non-existent model to public",
                async () => await cannotWritePublicModel(
                    getDb(UID_2),
                    uuid()
                )
            );

            test(
                "User not permitted to set someone else's model to public",
                async () => await cannotWritePublicModel(
                    getDb(UID_2),
                    MODELID_2
                )
            );

            test(
                "User not permitted to edit someone else's model's permissions",
                async () => await cannotWritePublicModel(
                    getDb(UID_2),
                    MODELID_1,
                    Permission.READ
                )
            );

            test(
                "User not permitted to remove someone else's model " +
                "from the public list",
                async () => await cannotRemovePublicModel(
                    getDb(UID_2),
                    MODELID_1
                )
            );

            test(
                "User not permitted to delete another user's whole " +
                "shared model list",
                async () => cannotRemoveEntireSharedModelListInPermissions(
                    getDb(UID_1),
                    UID_2
                )
            );

            test(
                "User not permitted to delete their own shared model list",
                async () => cannotRemoveEntireSharedModelListInPermissions(
                    getDb(UID_2),
                    UID_2
                )
            );
        });

        describe("Unauthenticated User", () => {
            test(
                "Unauthenticated user not allowed to read others' shared models",
                async () => await cannotReadUserSharedModels(
                    getDb(UID_UNAUTHENTICATED),
                    UID_2
                )
            );

            test(
                "Unauthenticated user not allowed to read others' shared model",
                async () => await cannotReadUserSharedModel(
                    getDb(UID_UNAUTHENTICATED),
                    UID_2,
                    MODELID_2
                )
            );

            test(
                "Unauthenticated user not permitted to add existing " +
                "model to others' shared list",
                async () => await cannotShareModelInPermissions(
                    getDb(UID_UNAUTHENTICATED),
                    MODELID_1,
                    UID_2
                )
            );

            test(
                "Unauthenticated user not permitted to add non-existent " +
                "model to others' shared list",
                async () => await cannotShareModelInPermissions(
                    getDb(UID_UNAUTHENTICATED),
                    uuid(),
                    UID_1
                )
            );

            test(
                "Unauthenticated user not permitted to read public models list",
                async () => await cannotReadPublicModels(
                    getDb(UID_UNAUTHENTICATED)
                )
            );

            test(
                "Unauthenticated user not permitted to add non-existent " +
                "model to public list",
                async () => await cannotWritePublicModel(
                    getDb(UID_UNAUTHENTICATED),
                    uuid()
                )
            );

            test(
                "Unauthenticated user not permitted to add existing " +
                "model to public list",
                async () => await cannotWritePublicModel(
                    getDb(UID_UNAUTHENTICATED),
                    MODELID_1
                )
            );

            test(
                "Unauthenticated user not permitted to edit public model's " +
                "permissions",
                async () => await cannotWritePublicModel(
                    getDb(UID_UNAUTHENTICATED),
                    MODELID_1,
                    Permission.READ
                )
            );

            test(
                "Unauthenticated user not permitted to delete a public model",
                async () => await cannotRemovePublicModel(
                    getDb(UID_UNAUTHENTICATED),
                    MODELID_1
                )
            );

            test(
                "Unauthenticated user not permitted to delete a model from a " +
                "user's shared list",
                async () => await cannotRemoveSharedModelInPermissions(
                    getDb(UID_UNAUTHENTICATED),
                    MODELID_2,
                    UID_2
                )
            );

            test(
                "Unauthenticated user not permitted to delete the whole " +
                "public models list",
                async () => await cannotRemoveEntirePublicModelsList(
                    getDb(UID_UNAUTHENTICATED)
                )
            );

            test(
                "Unauthenticated user not permitted to delete a user's " +
                "shared model list",
                async () => await cannotRemoveEntireSharedModelListInPermissions(
                    getDb(UID_UNAUTHENTICATED),
                    UID_2
                )
            );
        });
    });
}
