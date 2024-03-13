import FirebaseModel, { ComponentSchema, ModelSchema, SharedUsersSchema } from "./components/FirebaseModel"
import { ModelType } from "./FirebaseDataModel"

export interface CausalLoopComponentSchema extends ComponentSchema {
    components: {
        [componentId: string]: {
            type: string,
            data: any
        }
    }
}

export interface CausalLoopSchema extends ModelSchema {
    name: string,
    ownerUid: string,
    modelType: ModelType,
    sharedWith: SharedUsersSchema,
    openRead: boolean,
    openWrite: boolean,
    data: CausalLoopComponentSchema
}

export default class FirebaseCausalLoopModel
    extends FirebaseModel<CausalLoopSchema>
{
    public empty(uuid: string, name: string, ownerUid: string): void {
        this.uuid = uuid;
        this.data = {
            name: name,
            ownerUid: ownerUid,
            modelType: ModelType.CausalLoop,
            sharedWith: {},
            openRead: false,
            openWrite: false,
            data: {
                components: {}
            }
        };
    }
}
