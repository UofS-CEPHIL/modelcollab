import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import PointComponentPresentation from "./PointComponentPresentation";


export default abstract class TextComponentPresentation
    <DataType extends schema.TextFirebaseComponent<any>>
    extends PointComponentPresentation<DataType>
{
    updateComponent(
        component: DataType,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        super.updateComponent(component, cell, graph);
        cell.setValue(component.getData().text);
    }

    public isEqual(component: DataType, cell: Cell): boolean {
        const cpntText = component.getData().text;
        const cellText = cell.getValue();
        return super.isEqual(component, cell) && cpntText === cellText;
    }
}
