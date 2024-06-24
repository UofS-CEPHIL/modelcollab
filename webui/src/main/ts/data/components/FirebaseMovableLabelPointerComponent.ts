import { FirebaseMovableLabelProperties, FirebaseTextProperties } from "../FirebaseProperties";
import FirebasePointerComponent, { FirebasePointerData } from "./FirebasePointerComponent";
import FirebaseStaticModel from "./FirebaseStaticModel";

export type FirebaseMovableLabelPointerData = FirebasePointerData
    & FirebaseTextProperties
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

    public asChildOf(
        parent: FirebaseStaticModel,
        dx: number,
        dy: number,
    ): FirebaseMovableLabelPointerComponent<DataType> {
        const child = super.asChildOf(
            parent,
            dx,
            dy
        ) as FirebaseMovableLabelPointerComponent<DataType>;
        return child.withLabelPosition(
            child.getData().labelX - dx,
            child.getData().labelY - dy,
        );
    }

}
