import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../DrawingUtils";
import ComponentUiData, { RectangularComponent } from "./ComponentUiData";


export default class StaticModelUiData
    extends RectangularComponent<schema.StaticModelComponentData, schema.StaticModelComponent>
{

    public static PAD_PX: number = 20;

    private components: ComponentUiData[] | undefined;

    public setComponents(components: ComponentUiData[] | undefined): void {
        this.components = components;
    }

    public getComponents(): ComponentUiData[] {
        return this.components || [];
    }

    public getHeightPx(): number {
        if (!this.components || this.components.length === 0) {
            return StaticModelUiData.PAD_PX;
        }
        else {
            const minY: number = Math.min(
                ...this.components
                    .map(c => c.getMinY(this.components || []))
            );
            const maxY: number = Math.max(
                ...this.components
                    .map(c => c.getMaxY(this.components || []))
            );
            return maxY - minY + StaticModelUiData.PAD_PX * 2;
        }
    }

    public getWidthPx(): number {
        if (!this.components || this.components.length === 0) {
            return StaticModelUiData.PAD_PX;
        }
        else {
            const minX: number = Math.min(
                ...this.components
                    .map(c => c.getMinX(this.components || []))
            );
            const maxX: number = Math.max(
                ...this.components
                    .map(c => c.getMaxX(this.components || []))
            );
            return maxX - minX + StaticModelUiData.PAD_PX * 2;
        }
    }

    public getTopLeft(): Point {
        return { x: this.getData().x, y: this.getData().y };
    }

    public isPointable(): boolean {
        return false;
    }

    public withData(data: schema.StaticModelComponentData): StaticModelUiData {
        return new StaticModelUiData(
            this.getDatabaseObject().withData(data)
        );
    }
}
