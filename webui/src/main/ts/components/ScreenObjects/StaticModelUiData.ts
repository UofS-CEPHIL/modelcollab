import { FirebaseComponentModel as schema } from "database/build/export";
import { Point } from "../DrawingUtils";
import ComponentUiData, { RectangularComponent } from "./ComponentUiData";


export default class StaticModelUiData
    extends RectangularComponent<schema.StaticModelComponentData, schema.StaticModelComponent>
{

    public static PAD_PX: number = 20;

    private components: ComponentUiData[] | undefined;

    public setComponents(components: ComponentUiData[] | undefined): void {
        this.components = components
            ?.map(c => {
                if (c.getData().from && c.getData().to)
                    return c.withData({
                        ...c.getData(),
                        from: `${this.getId()}/${c.getData().from}`,
                        to: `${this.getId()}/${c.getData().to}`
                    });
                else
                    return c;
            }).map(c => c.withId(this.getId() + "/" + c.getId()))
    }

    public getComponents(): ComponentUiData[] {
        return this.components || [];
    }

    private getChildComponentsWithOffset(xOffset: number, yOffset: number): ComponentUiData[] {
        return this.getComponents().map(
            c => {
                if (c.getData().x && c.getData().y) {
                    return c.withData({
                        ...c.getData(),
                        x: c.getData().x - xOffset,
                        y: c.getData().y - yOffset
                    });
                }
                else {
                    return c
                }
            }
        );
    }

    public getComponentsRelativeToSelf(): ComponentUiData[] {
        return this.getChildComponentsWithOffset(
            this.getChildXOffset(),
            this.getChildYOffset()
        );
    }

    public getComponentsRelativeToCanvas(): ComponentUiData[] {
        return this.getChildComponentsWithOffset(
            this.getChildXOffset() - this.getData().x,
            this.getChildYOffset() - this.getData().y
        );
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

    public withId(id: string): StaticModelUiData {
        return new StaticModelUiData(
            new schema.StaticModelComponent(
                id,
                this.getData()
            )
        );
    }

    private getChildXOffset(): number {
        return Math.min(
            ...this.getComponents()
                .filter(c => c.getData().x !== undefined)
                .map(c => c.getData().x as number)
        ) - StaticModelUiData.PAD_PX;
    }

    private getChildYOffset(): number {
        return Math.min(
            ...this.getComponents()
                .filter(c => c.getData().y !== undefined)
                .map(c => c.getData().y as number)
        ) - StaticModelUiData.PAD_PX;
    }
}
