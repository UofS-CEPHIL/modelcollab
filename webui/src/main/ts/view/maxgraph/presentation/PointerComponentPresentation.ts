import { Cell, EdgeParameters, Point } from "@maxgraph/core";
import FirebasePointerComponent from "../../../data/components/FirebasePointerComponent";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointerComponentPresentation
    <DataType extends FirebasePointerComponent<any>>
    implements ComponentPresentation<DataType>
{

    protected abstract makeEdgeParameters(
        component: DataType,
        parent: Cell,
        source: Cell,
        target: Cell,
        movable: boolean
    ): EdgeParameters;

    public addComponent(
        component: DataType,
        graph: MCGraph,
        parent: Cell = graph.getDefaultParent(),
        loadStaticModelComponents?: ((name: string) => void),
        movable: boolean = true,
        source?: Cell,
        target?: Cell,
    ): Cell | Cell[] {
        if (!source)
            source = graph.getCellWithIdOrThrow(component.getData().from);
        if (!target)
            target = graph.getCellWithIdOrThrow(component.getData().to);

        const e = graph.insertEdge(
            this.makeEdgeParameters(
                component,
                parent ?? graph.getDefaultParent(),
                source,
                target,
                movable
            )
        );

        graph.getDataModel().setStyle(
            e,
            {
                ...e.getStyle() ?? {},
                entryX: component.getData().entryX,
                entryY: component.getData().entryY,
                exitX: component.getData().exitX,
                exitY: component.getData().exitY,
            }
        );

        if (component.getData().points.length > 0) {
            const geo = e.getGeometry()!.clone();
            geo.points = component
                .getData()
                .points
                .map((p: { x: number, y: number }) => new Point(p.x, p.y));
            graph.getDataModel().setGeometry(e, geo);
        }

        return e;
    }

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
        loadedModels?: LoadedStaticModel[]
    ): void {
        cell.setValue(component);
        const geo = cell.getGeometry()!.clone();
        geo.points = component
            .getData()
            .points
            .map((p: { x: number, y: number }) => new Point(p.x, p.y));
        graph.getDataModel().setGeometry(cell, geo);
        graph.getDataModel().setStyle(
            cell,
            {
                ...cell.getStyle() ?? {},
                entryX: component.getData().entryX,
                entryY: component.getData().entryY,
                exitX: component.getData().exitX,
                exitY: component.getData().exitY,
            }
        );
    }

    public updateComponent(
        component: DataType,
        cell: Cell,
        graph?: MCGraph
    ): DataType {
        throw new Error("Method not implemented.");
    }


}
