import ComponentType from "./ComponentType";
import { FirebaseComponentBase, FirebaseDataObject } from "./FirebaseComponent";
import FirebaseStaticModel from "./FirebaseStaticModel";

export interface FirebasePointData extends FirebaseDataObject {
    x: number;
    y: number;
}

export default abstract class FirebasePointComponent
    <DataType extends FirebasePointData>
    extends FirebaseComponentBase<DataType>
{
    constructor(id: string, data: DataType) {
        super(id, data);
    }

    public abstract getType(): ComponentType;

    public abstract withData(
        d: FirebasePointData
    ): FirebasePointComponent<DataType>;

    public abstract withId(id: string): FirebasePointComponent<DataType>;

    public withUpdatedLocation(
        dx: number,
        dy: number
    ): FirebasePointComponent<DataType> {
        const oldData = this.getData();
        return this.withData(
            { ...oldData, x: oldData.x + dx, y: oldData.y + dy }
        );
    }

    public asChildOf(
        parent: FirebaseStaticModel,
        dx: number,
        dy: number,
    ): FirebasePointComponent<DataType> {
        const child = super.asChildOf(
            parent,
            dx,
            dy
        ) as FirebasePointComponent<DataType>;
        return child.withUpdatedLocation(dx * -1, dy * -1);
    }
}
