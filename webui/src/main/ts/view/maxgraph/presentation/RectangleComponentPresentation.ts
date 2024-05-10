import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseRectangleComponent from "../../../data/components/FirebaseRectangleComponent";
import MCGraph from "../MCGraph";
import PointComponentPresentation from "./PointComponentPresentation";

export default abstract class RectangleComponentPresentation
    <DataType extends FirebaseRectangleComponent<any>>
    extends PointComponentPresentation<DataType>
{

    protected getVertexParameters(
        component: DataType,
        graph: MCGraph,
        parent?: Cell,
    ): VertexParameters {
        return {
            ...super.getVertexParameters(component, graph, parent),
            width: component.getData().width,
            height: component.getData().height,
        };
    }

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
    ): void {
        super.updateCell(component, cell, graph);
        const newGeo = cell.getGeometry()!.clone();
        newGeo.width = component.getData().width;
        newGeo.height = component.getData().height;
        graph.getDataModel().setGeometry(cell, newGeo);
    }

    public updateComponent(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
    ): DataType {
        if (!cell.getGeometry()) {
            console.error(
                "No geometry found for component " + component.getId()
            );
            return component;
        }
        const geo = cell.getGeometry()!;
        const newComponent = super.updateComponent(component, cell, graph);
        return newComponent.withData({
            ...newComponent.getData(),
            width: geo.width,
            height: geo.height,
        }) as DataType;
    }
}
