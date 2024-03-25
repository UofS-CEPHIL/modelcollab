import { Cell } from "@maxgraph/core";
import FirebaseRectangleComponent from "../../../data/components/FirebaseRectangleComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import PointComponentPresentation from "./PointComponentPresentation";

export default abstract class RectangleComponentPresentation
    <DataType extends FirebaseRectangleComponent<any>>
    extends PointComponentPresentation<DataType>
{
    public updateCell(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
        _: LoadedStaticModel[]
    ): void {
        super.updateCell(component, cell, graph, _);
        const newGeo = cell.getGeometry()!.clone();
        newGeo.width = component.getData().width;
        newGeo.height = component.getData().height;
        graph.getDataModel().setGeometry(cell, newGeo);
    }
}
