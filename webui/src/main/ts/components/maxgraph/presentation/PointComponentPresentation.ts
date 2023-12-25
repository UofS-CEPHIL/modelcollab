import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { LoadedStaticModel } from "../CanvasScreen";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointComponentPresentation
    <DataType extends schema.PointFirebaseComponent<any>>
    implements ComponentPresentation<DataType>
{
    public abstract addComponent(
        component: DataType,
        graph: StockFlowGraph,
        parent?: Cell,
        loadStaticModelComponents?: (name: string) => void,
        movable?: boolean
    ): Cell | Cell[];

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: StockFlowGraph,
        _: LoadedStaticModel[]
    ): void {
        const newGeo = cell.getGeometry()!.clone();
        newGeo.x = component.getData().x;
        newGeo.y = component.getData().y;
        graph.getDataModel().setGeometry(cell, newGeo);
    }

    public updateComponent(
        component: DataType,
        cell: Cell,
        _: StockFlowGraph
    ): DataType {
        const geo = cell.getGeometry()!;
        return component.withData(
            { ...component.getData(), x: geo.x, y: geo.y }
        ) as DataType;
    }
}
