import { Cell, VertexParameters } from "@maxgraph/core";
import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointComponentPresentation
    <DataType extends FirebasePointComponent<any>>
    implements ComponentPresentation<DataType>
{

    protected abstract makeVertexParameters(
        parent: Cell,
        component: DataType,
        movable: boolean
    ): VertexParameters;

    public addComponent(
        component: DataType,
        graph: MCGraph,
        parent?: Cell,
        _?: (name: string) => void,
        movable: boolean = true
    ): Cell | Cell[] {
        return graph.insertVertex(this.makeVertexParameters(
            parent ?? graph.getDefaultParent(),
            component,
            movable
        ));
    }

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
        _: MCGraph,
    ): DataType {
        if (!cell.getGeometry()) {
            console.error(
                "No geometry found for component " + component.getId()
            );
            return component;
        }
        const geo = cell.getGeometry()!;
        return component.withData({
            ...component.getData(),
            x: geo.x,
            y: geo.y,
        }) as DataType;
    }
}
