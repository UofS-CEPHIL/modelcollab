import { Cell, CellStyle, VertexParameters } from "@maxgraph/core";
import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import MCGraph from "../MCGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointComponentPresentation
    <DataType extends FirebasePointComponent<any>>
    implements ComponentPresentation<DataType>
{

    protected abstract getDefaultStyle(isInner?: boolean): CellStyle;

    public addComponent(
        component: DataType,
        graph: MCGraph,
        parent?: Cell,
    ): Cell | Cell[] {
        return graph.insertVertex(
            this.getVertexParameters(
                component,
                graph,
                parent,
            )
        );
    }

    protected getVertexParameters(
        component: DataType,
        graph: MCGraph,
        parent?: Cell,
    ): VertexParameters {
        return {
            parent: parent ?? graph.getDefaultParent(),
            id: component.getId(),
            value: component,
            x: component.getData().x,
            y: component.getData().y,
            style: this.getStyle(component, parent !== graph.getDefaultParent())
        };
    }

    /**
     * Get the style to use for the given component.
     * Override this in child classes to add specifics.
     */
    protected getStyle(
        _: DataType,
        isInner: boolean = false
    ): CellStyle {
        return this.getDefaultStyle(isInner);
    }

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
    ): void {
        cell.setValue(component);
        const newGeo = cell.getGeometry()!.clone();
        newGeo.x = component.getData().x;
        newGeo.y = component.getData().y;
        graph.getDataModel().setGeometry(cell, newGeo);
    }

    public updateComponent(
        component: DataType,
        cell: Cell,
        _: MCGraph,
    ): DataType {
        if (!cell.getGeometry()) {
            console.error(
                "No geometry found for component " + component.getId()
            );
            return component;
        }
        const geo = cell.getGeometry()!;
        return component.withData({
            ...component.getData(),
            x: geo.x,
            y: geo.y,
        }) as DataType;
    }
}
