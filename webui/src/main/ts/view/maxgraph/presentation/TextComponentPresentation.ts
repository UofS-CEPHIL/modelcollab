import { Cell } from "@maxgraph/core";
import FirebaseTextComponent from "../../../data/components/FirebaseTextComponent";
import MCGraph from "../MCGraph";
import RectangleComponentPresentation from "./RectangleComponentPresentation";


export default abstract class TextComponentPresentation
    <DataType extends FirebaseTextComponent<any>>
    extends RectangleComponentPresentation<DataType>
{
    public updateComponent(
        component: DataType,
        cell: Cell,
        graph: MCGraph
    ): DataType {
        const update: DataType = super.updateComponent(component, cell, graph);
        return update.withData(
            { ...update.getData(), text: cell.getValue().getData().text }
        ) as DataType;
    }
}
