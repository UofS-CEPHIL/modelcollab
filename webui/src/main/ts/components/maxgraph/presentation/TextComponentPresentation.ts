import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { LoadedStaticModel } from "../CanvasScreen";
import StockFlowGraph from "../StockFlowGraph";
import PointComponentPresentation from "./PointComponentPresentation";


export default abstract class TextComponentPresentation
    <DataType extends schema.TextFirebaseComponent<any>>
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
