import { Cell } from "@maxgraph/core";
import FirebaseTextComponent from "../../../data/components/FirebaseTextComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import StockFlowGraph from "../StockFlowGraph";
import PointComponentPresentation from "./PointComponentPresentation";


export default abstract class TextComponentPresentation
    <DataType extends FirebaseTextComponent<any>>
    extends PointComponentPresentation<DataType>
{
    public updateCell(
        component: DataType,
        cell: Cell,
        graph: StockFlowGraph,
        loadedModels: LoadedStaticModel[]
    ): void {
        super.updateCell(component, cell, graph, loadedModels);
        cell.setValue(component);
    }

    public updateComponent(
        component: DataType,
        cell: Cell,
        graph: StockFlowGraph
    ): DataType {
        const update: DataType = super.updateComponent(component, cell, graph);
        return update.withData(
            { ...update.getData(), text: cell.getValue().getData().text }
        ) as DataType;
    }
}
