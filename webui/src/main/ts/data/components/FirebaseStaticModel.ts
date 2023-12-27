import ComponentType from "./ComponentType";
import FirebasePointComponent, {
    FirebasePointData
} from "./FirebasePointComponent";

export interface FirebaseStaticModelData extends FirebasePointData {
    x: number,
    y: number,
    color: string,
    modelId: string
}

export default class FirebaseStaticModel
    extends FirebasePointComponent<FirebaseStaticModelData>
{
    public getType(): ComponentType {
        return ComponentType.STATIC_MODEL;
    }

    public withData(
        data: FirebaseStaticModelData
    ): FirebaseStaticModel {
        return new FirebaseStaticModel(this.getId(), data);
    }

    public withId(id: string): FirebaseStaticModel {
        return new FirebaseStaticModel(
            id,
            Object.assign({}, this.getData())
        );
    }
}
