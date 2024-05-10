import { FirebaseColorProperties, FirebaseMovableLabelProperties, FirebaseTextProperties } from "../FirebaseProperties";
import FirebasePointerComponent, { FirebasePointerData } from "./FirebasePointerComponent";

export type FirebaseMovableLabelPointerData = FirebasePointerData
    & FirebaseTextProperties
    & FirebaseColorProperties
    & FirebaseMovableLabelProperties;

export default abstract class FirebaseMovableLabelPointerComponent
    <DataType extends FirebaseMovableLabelPointerData>
    extends FirebasePointerComponent<DataType>
{

    public static readonly UNINITIALIZED_LABEL_POS = -100;

    public isUninitializedLabelPosition(): boolean {
        const u = FirebaseMovableLabelPointerComponent.UNINITIALIZED_LABEL_POS;
        return this.getData().labelX === u || this.getData().labelY === u;
    }

    public labelPositionEqual(otherX: number, otherY: number): boolean {
        return this.getData().labelX === otherX
            && this.getData().labelY === otherY;
    }

    public withLabelPosition(
        labelX: number,
        labelY: number
    ): FirebaseMovableLabelPointerComponent<DataType> {
        return this.withData({
            ...this.getData(),
            labelX,
            labelY,
        }) as FirebaseMovableLabelPointerComponent<DataType>;
    }

}
