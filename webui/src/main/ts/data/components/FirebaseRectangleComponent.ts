import FirebasePointComponent, { FirebasePointData } from "./FirebasePointComponent";

export interface FirebaseRectangleData extends FirebasePointData {
    x: number;
    y: number;
    width: number;
    height: number;
}


export default abstract class FirebaseRectangleComponent
    <DataType extends FirebaseRectangleData>
    extends FirebasePointComponent<DataType>
{

    public abstract withData(d: DataType): FirebaseRectangleComponent<DataType>;

    public withUpdatedSize(
        width: number,
        height: number
    ): FirebaseRectangleComponent<DataType> {
        return this.withData({
            ...this.getData(),
            width,
            height
        });
    }
}
