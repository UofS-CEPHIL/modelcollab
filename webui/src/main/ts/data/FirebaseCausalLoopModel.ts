import FirebaseModel, { ComponentSchema } from "./components/FirebaseModel"

export interface CausalLoopSchema extends ComponentSchema {
    components: {
        [componentId: string]: {
            type: string,
            data: any
        }
    }
}

export default class FirebaseCausalLoopModel
    extends FirebaseModel<CausalLoopSchema>
{
    public empty(uuid: string): void {
        this.uuid = uuid;
        this.data = { components: {} }
    }
}
