import { Cell } from "@maxgraph/core";
import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointComponentPresentation
    <DataType extends FirebasePointComponent<any>>
    implements ComponentPresentation<DataType>
{
    public abstract addComponent(
        component: DataType,
        graph: MCGraph,
        parent?: Cell,
        loadStaticModelComponents?: (name: string) => void,
        movable?: boolean
    ): Cell | Cell[];

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
        _: LoadedStaticModel[]
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
        _: MCGraph
    ): DataType {
        const geo = cell.getGeometry()!;
        return component.withData(
            { ...component.getData(), x: geo.x, y: geo.y }
        ) as DataType;
    }
}
