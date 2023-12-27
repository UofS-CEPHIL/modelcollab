import { Cell } from "@maxgraph/core";
import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointComponentPresentation
    <DataType extends FirebasePointComponent<any>>
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
