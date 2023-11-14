import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import PointComponentPresentation from "./PointComponentPresentation";


export default abstract class TextComponentPresentation
    <DataType extends schema.TextFirebaseComponent<any>>
    extends PointComponentPresentation<DataType>
{
    public updateCell(
        component: DataType,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        super.updateCell(component, cell, graph);
        cell.setValue(component);
    }

    public updateComponent(component: DataType, cell: Cell): DataType {
        const update: DataType = super.updateComponent(component, cell);
        return update.withData(
            { ...update.getData(), text: cell.getValue().getData().text }
        ) as DataType;
    }

    public isEqual(component: DataType, cell: Cell): boolean {
        const cpntText = component.getData().text;
        const cellText = cell.getValue().getData().text;
        return super.isEqual(component, cell) && cpntText === cellText;
    }
}
