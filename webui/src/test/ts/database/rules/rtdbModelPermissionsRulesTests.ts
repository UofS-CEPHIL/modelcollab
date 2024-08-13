import { assertFails } from "@firebase/rules-unit-testing";
import { ref, remove } from "firebase/database";
import { v4 as uuid } from "uuid";
import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import RTDBSchema, { Permission } from "../../../../main/ts/data/RTDBSchema";
import { cannotReadPublicModels, cannotReadUserSharedModel, cannotReadUserSharedModels } from "./rtdbReadFailures";
import { canReadPublicModels, canReadUserSharedModel, canReadUserSharedModels } from "./rtdbReadSuccesses";
import { getDb, UID_1, UID_2, UID_3, MODELID_1, UID_UNAUTHENTICATED, MODELNAME_1, NAME_1, NAME_2, NAME_3, EMAIL_1, EMAIL_2, EMAIL_3, MODELID_2, MODELNAME_2, env } from "./rtdbRules.test";
import { cannotRemoveEntirePublicModelsList, cannotRemoveEntireSharedModelListInPermissions, cannotRemovePublicModel, cannotRemoveSharedModelInPermissions, cannotShareModelInPermissions, cannotWritePublicModel } from "./rtdbWriteFailures";
import { canRemovePublicModel, canRemoveSharedModelInPermissions, canShareModelInPermissions, canWriteModelMetadata, canWriteNewUser, canWritePublicModel } from "./rtdbWriteSuccesses";

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
                await canShareModelInPermissions(
                    db,
                    MODELID_2,
                    UID_2
                );
                await canWritePublicModel(
                    db,
                    MODELID_1,
                    Permission.READWRITE
                );
            });
        });

        test(
            "User not permitted to add a non-existent model to " +
            "others' shared list",
            async () => await cannotShareModelInPermissions(
                getDb(UID_1),
                uuid(),
                UID_2
            )
        );

        test(
            "User not permitted to add non-existent model to own shared list",
            async () => await cannotShareModelInPermissions(
                getDb(UID_2),
                uuid(),
                UID_2
            )
        );

        test(
            "User not permitted to add other user's model to own shared list",
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
            "User permitted to remove their model from other user's shared list",
            async () => await canRemoveSharedModelInPermissions(
                getDb(UID_1),
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
            "User permitted to add own model to others' shared list",
            async () => await canShareModelInPermissions(
                getDb(UID_1),
                MODELID_2,
                UID_2
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

        test(
            "User not permitted to delete the whole public models list",
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
}
