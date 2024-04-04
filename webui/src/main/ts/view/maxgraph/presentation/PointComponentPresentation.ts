import { Cell, VertexParameters } from "@maxgraph/core";
import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import ComponentPresentation from "./ComponentPresentation";

export default abstract class PointComponentPresentation
    <DataType extends FirebasePointComponent<any>>
    implements ComponentPresentation<DataType>
{

    protected abstract makeVertexParameters(
        parent: Cell,
        component: DataType,
        graph: MCGraph,
    ): VertexParameters;

    public getNormalStrokeColorForComponent(_: DataType): string {
        return theme.palette.canvas.contrastText;
    }

    public getNormalTextColorForComponent(_: DataType): string {
        return theme.palette.canvas.contrastText;
    }

    public getErrorStrokeColorForComponent(_: DataType): string {
        return theme.palette.error.main;
    }

    public getErrorTextColorForComponent(_: DataType): string {
        return theme.palette.error.main;
    }

    public getHoveredStrokeColorForComponent(_: DataType): string {
        return theme.palette.secondary.main;
    }

    public getHoveredTextColorForComponent(_: DataType): string {
        return theme.palette.secondary.main;
    }

    public addComponent(
        component: DataType,
        graph: MCGraph,
        parent?: Cell,
    ): Cell | Cell[] {
        return graph.insertVertex(this.makeVertexParameters(
            parent ?? graph.getDefaultParent(),
            component,
            graph
        ));
    }

    public updateCell(
        component: DataType,
        cell: Cell,
        graph: MCGraph,
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
