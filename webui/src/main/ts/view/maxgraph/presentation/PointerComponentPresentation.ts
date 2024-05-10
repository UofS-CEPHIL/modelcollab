import { Cell, CellStyle, Point } from "@maxgraph/core";
import FirebasePointerComponent, { FirebasePointerData } from "../../../data/components/FirebasePointerComponent";
import MCGraph from "../MCGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointerComponentPresentation
    <DataType extends FirebasePointerComponent<FirebasePointerData>>
    implements ComponentPresentation<DataType>
{

    protected abstract getDefaultStyle(isInner?: boolean): CellStyle;

    public addComponent(
        component: DataType,
        graph: MCGraph,
        parent: Cell = graph.getDefaultParent(),
        source?: Cell,
        target?: Cell,
    ): Cell | Cell[] {
        if (!source)
            source = graph.getCellWithIdOrThrow(component.getData().from);
        if (!target)
            target = graph.getCellWithIdOrThrow(component.getData().to);

        const isInner = parent !== graph.getDefaultParent();
        const e = graph.insertEdge({
            parent,
            id: component.getId(),
            value: component,
            source,
            target,
            style: this.getStyle(component, isInner)
        });

        const geo = e.getGeometry()!.clone();
        geo.points = this.getPoints(component);
        graph.getDataModel().setGeometry(e, geo);

        return e;
    }

    /**
     * Get the style to use for the given component.
     * Override this in child classes to add details.
     */
    protected getStyle(component: DataType, isInner: boolean): CellStyle {
        return {
            ...this.getDefaultStyle(isInner),
            entryX: component.getData().entryX,
            entryY: component.getData().entryY,
            exitX: component.getData().exitX,
            exitY: component.getData().exitY,
            strokeColor: component.getData().color,
            fontColor: component.getData().color,
        };
    }

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
    ): void {
        cell.setValue(component);
        const geo = cell.getGeometry()!.clone();
        geo.points = this.getPoints(component);
        graph.getDataModel().setGeometry(cell, geo);
        graph.getDataModel().setStyle(
            cell,
            {
                ...cell.getStyle() ?? {},
                entryX: component.getData().entryX,
                entryY: component.getData().entryY,
                exitX: component.getData().exitX,
                exitY: component.getData().exitY,
                entryDx: undefined,
                entryDy: undefined,
                entryPerimeter: undefined,
                exitPerimeter: undefined,
            }
        );
    }

    private getPoints(component: DataType): Point[] {
        return component.getData().points
            ? component
                .getData()
                .points
                .map((p: { x: number, y: number }) => new Point(p.x, p.y))
            : [];
    }

    public updateComponent(
        component: DataType,
        cell: Cell,
        _: MCGraph
    ): DataType {
        const geo = cell.getGeometry();
        const points = geo ? (geo.points ?? []) : [];
        return component.withData({
            ...component.getData(),
            points: points.map(FirebasePointerComponent.extractPoint),
            entryX: cell.style.entryX,
            entryY: cell.style.entryY,
            exitX: cell.style.exitX,
            exitY: cell.style.exitY,
        }) as DataType;
    }
}
