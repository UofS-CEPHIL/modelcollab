import { ModelType } from "../../../../main/ts/data/FirebaseDataModel";
import { cannotReadUserEmail, cannotReadUserName, cannotReadUserOwnedModel, cannotReadUserOwnedModels } from "../rtdbReadFailures";
import { canReadUserEmail, canReadUserName, canReadUserOwnedModel, canReadUserOwnedModels, } from "../rtdbReadSuccesses";
import { EMAIL_1, EMAIL_2, EMAIL_3, MODELID_1, MODELNAME_1, NAME_1, NAME_2, NAME_3, UID_1, UID_2, UID_3, getDb, UID_UNAUTHENTICATED, env, MODELID_2 } from "../rtdb.test";
import { cannotAddUserOwnedModel, cannotEditUserEmail, cannotEditUserName, cannotRemoveAllUserEntries, cannotRemoveUserEntry, cannotRemoveUserOwnedModel, cannotWriteNewUser } from "../rtdbWriteFailures";
import { canAddUserOwnedModel, canEditUserEmail, canEditUserName, canRemoveUserEntry, canRemoveUserOwnedModel, canWriteModelMetadata, canWriteNewUser } from "../rtdbWriteSuccesses";

export default function describeUserDataRulesTests(): void {
    describe("User data", () => {
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
                await canWriteModelMetadata(
                    db,
                    MODELID_1,
                    MODELNAME_1,
                    ModelType.StockFlow,
                    UID_1
                );
                await canAddUserOwnedModel(
                    db,
                    UID_1,
                    MODELID_1
                );
            });
        });

        test(
            "User permitted to create their own user entry",
            async () => await canWriteNewUser(
                getDb(UID_3),
                UID_3,
                NAME_3,
                EMAIL_3,
            )
        );

        test(
            "User not permitted to create another user's entry",
            async () => await cannotWriteNewUser(
                getDb(UID_1),
                UID_3,
                NAME_3,
                EMAIL_3
            )
        );

        test(
            "User permitted to read other user's name",
            async () => await canReadUserName(
                getDb(UID_1),
                UID_2
            )
        );

        test(
            "User permitted to read other user's email",
            async () => await canReadUserEmail(
                getDb(UID_2),
                UID_1
            )
        );

        test(
            "User permitted to read own name",
            async () => await canReadUserName(
                getDb(UID_2),
                UID_2
            )
        );

        test(
            "User permitted to read own email",
            async () => await canReadUserEmail(
                getDb(UID_1),
                UID_1
            )
        );

        test(
            "User permitted to edit their own email",
            async () => await canEditUserEmail(
                getDb(UID_1),
                UID_1
            )
        );

        test(
            "User permitted to edit their own name",
            async () => await canEditUserName(
                getDb(UID_2),
                UID_2
            )
        );

        test(
            "User not permitted to edit another user's name",
            async () => await cannotEditUserName(
                getDb(UID_2),
                UID_1
            )
        );

        test(
            "User permitted to read their own owned models list",
            async () => await canReadUserOwnedModels(
                getDb(UID_1),
                UID_1
            )
        );

        test(
            "User permitted to read their own owned model",
            async () => await canReadUserOwnedModel(
                getDb(UID_1),
                UID_1,
                MODELID_1
            )
        );

        test(
            "User permitted to add a model to their owned models list",
            async () => await canAddUserOwnedModel(
                getDb(UID_1),
                UID_1,
                MODELID_2
            )
        );

        test(
            "User permitted to remove a model from their owned models list",
            async () => await canRemoveUserOwnedModel(
                getDb(UID_1),
                UID_1,
                MODELID_1
            )
        );

        test(
            "User not permitted to read other user's owned models list",
            async () => await cannotReadUserOwnedModels(
                getDb(UID_2),
                UID_1
            )
        );

        test(
            "User not permitted to read other user's owned model",
            async () => await cannotReadUserOwnedModel(
                getDb(UID_2),
                UID_1,
                MODELID_1
            )
        );

        test(
            "User not permitted to add a model to another user's owned " +
            "models list",
            async () => await cannotAddUserOwnedModel(
                getDb(UID_2),
                UID_1,
                MODELID_2
            )
        );

        test(
            "User not permitted to remove a model from another user's owned " +
            "models list",
            async () => await cannotRemoveUserOwnedModel(
                getDb(UID_2),
                UID_1,
                MODELID_1
            )
        );

        test(
            "User not permitted to edit another user's email",
            async () => await cannotEditUserEmail(
                getDb(UID_1),
                UID_2
            )
        );

        test(
            "User not permitted to delete another user's entry",
            async () => await cannotRemoveUserEntry(
                getDb(UID_2),
                UID_1
            )
        );

        test(
            "User permitted to delete their own user entry",
            async () => await canRemoveUserEntry(
                getDb(UID_2),
                UID_2
            )
        );

        test(
            "User not permitted to delete the entire Users list",
            async () => await cannotRemoveAllUserEntries(
                getDb(UID_1)
            )
        );

        test(
            "Unauthenticated user not permitted to create user entry",
            async () => await cannotWriteNewUser(
                getDb(UID_UNAUTHENTICATED),
                UID_3,
                NAME_3,
                EMAIL_3
            )
        );

        test(
            "Unauthenticated user not permitted to delete a user's entry",
            async () => await cannotRemoveUserEntry(
                getDb(UID_UNAUTHENTICATED),
                UID_1
            )
        );

        test(
            "Unauthenticated user not permitted to delete the entire Users list",
            async () => await cannotRemoveAllUserEntries(
                getDb(UID_UNAUTHENTICATED)
            )
        );

        test(
            "Unauthenticated user not permitted to edit user's name",
            async () => await cannotEditUserName(
                getDb(UID_UNAUTHENTICATED),
                UID_1
            )
        );

        test(
            "Unauthenticated user not permitted  to edit user's email",
            async () => await cannotEditUserEmail(
                getDb(UID_UNAUTHENTICATED),
                UID_2
            )
        );

        test(
            "Unauthenticated user not permitted to read user's name",
            async () => await cannotReadUserName(
                getDb(UID_UNAUTHENTICATED),
                UID_1
            )
        );

        test(
            "Unauthenticated user not permitted to read user's email",
            async () => await cannotReadUserEmail(
                getDb(UID_UNAUTHENTICATED),
                UID_1
            )
        );

        test(
            "Unauthenticated user not permitted to read user's owned models",
            async () => await cannotReadUserOwnedModels(
                getDb(UID_UNAUTHENTICATED),
                UID_1
            )
        );

        test(
            "Unauthenticated user not permitted to read user's owned model",
            async () => await cannotReadUserOwnedModel(
                getDb(UID_UNAUTHENTICATED),
                UID_1,
                MODELID_1
            )
        );

        test(
            "Unauthenticated user not permitted to add a model to a user's " +
            "owned models list",
            async () => await cannotAddUserOwnedModel(
                getDb(UID_UNAUTHENTICATED),
                UID_1,
                MODELID_2
            )
        );

        test(
            "Unauthenticated user not permitted to remove a model from a " +
            "user's owned models list",
            async () => await cannotRemoveUserOwnedModel(
                getDb(UID_UNAUTHENTICATED),
                UID_1,
                MODELID_1
            )
        );
    });
}
