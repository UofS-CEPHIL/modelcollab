import { Cell, CellStyle, VertexParameters } from "@maxgraph/core";
import FirebaseLoopIcon from "../../../data/components/FirebaseLoopIcon";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import LoopIconShape from "./LoopIconShape";
import RectangleComponentPresentation from "./RectangleComponentPresentation";

export default class LoopIconPresentation
    extends RectangleComponentPresentation<FirebaseLoopIcon>
{

    protected makeVertexParameters(
        parent: Cell,
        component: FirebaseLoopIcon,
        graph: MCGraph,
    ): VertexParameters {
        const isInner = parent !== graph.getDefaultParent();
        return {
            parent,
            id: component.getId(),
            value: component,
            x: component.getData().x,
            y: component.getData().y,
            width: component.getData().width,
            height: component.getData().height,
            style: LoopIconPresentation.getVertexStyle(isInner)
        };
    }

    public updateCell(
        component: FirebaseLoopIcon,
        cell: Cell,
        graph: MCGraph,
    ): void {
        super.updateCell(component, cell, graph);
        const style = { ...cell.getStyle() };
        style.fontColor = component.getData().color;
        style.strokeColor = component.getData().color;
        graph.batchUpdate(() => graph.getDataModel().setStyle(cell, style));
    }

    public updateComponent(
        component: FirebaseLoopIcon,
        cell: Cell,
        graph: MCGraph,
    ): FirebaseLoopIcon {
        const newComponent = super.updateComponent(component, cell, graph);
        return newComponent.withData({
            ...newComponent.getData(),
            color: cell.getStyle().fontColor!
        });
    }

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: LoopIconShape.LOOP_ICON_NAME,
            fillColor: theme.palette.canvas.main,
            strokeWidth: theme.custom.maxgraph.loopIcon.strokeWidth,
            strokeColor: theme.palette.canvas.contrastText,
            fontColor: theme.palette.canvas.contrastText,
            fontSize: theme.custom.maxgraph.loopIcon.fontSize,
            resizable: !isInner,
            movable: !isInner,
            editable: false,
        };
    }
}
