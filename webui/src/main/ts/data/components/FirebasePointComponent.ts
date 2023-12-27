import ComponentType from "./ComponentType";
import { FirebaseComponentBase, FirebaseDataObject } from "./FirebaseComponent";

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
}
