import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointComponentPresentation
    <DataType extends schema.PointFirebaseComponent<any>>
    implements ComponentPresentation<DataType>
{
    public abstract addComponent(
        component: DataType,
        graph: StockFlowGraph
    ): void;

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        const newGeo = cell.getGeometry()!.clone();
        newGeo.x = component.getData().x;
        newGeo.y = component.getData().y;
        graph.getDataModel().setGeometry(cell, newGeo);
    }

    public updateComponent(component: DataType, cell: Cell): DataType {
        const geo = cell.getGeometry()!;
        return component.withData(
            { ...component.getData(), x: geo.x, y: geo.y }
        ) as DataType;
    }

    public isEqual(component: DataType, cell: Cell): boolean {
        const cpntX = component.getData().x;
        const cellX = cell.getGeometry()!.getPoint().x;
        const cpntY = component.getData().y;
        const cellY = cell.getGeometry()!.getPoint().y;
        return (cpntX === cellX && cpntY === cellY);
    }
}
