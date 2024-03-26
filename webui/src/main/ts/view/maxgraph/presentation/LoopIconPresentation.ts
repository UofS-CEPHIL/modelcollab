import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseLoopIcon from "../../../data/components/FirebaseLoopIcon";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import LoopIconShape from "./LoopIconShape";
import RectangleComponentPresentation from "./RectangleComponentPresentation";

export default class LoopIconPresentation
    extends RectangleComponentPresentation<FirebaseLoopIcon>
{
    public addComponent(
        component: FirebaseLoopIcon,
        graph: MCGraph,
        parent: Cell = graph.getDefaultParent(),
        loadStaticModelComponents?: ((name: string) => void),
        movable: boolean = true
    ): Cell | Cell[] {
        return graph.insertVertex(this.getIconArgs(
            parent,
            component,
            movable
        ));
    }

    public getIconArgs(
        parent: Cell,
        component: FirebaseLoopIcon,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            id: component.getId(),
            value: component,
            x: component.getData().x,
            y: component.getData().y,
            width: component.getData().width,
            height: component.getData().height,
            style: {
                shape: LoopIconShape.LOOP_ICON_NAME,
                movable,
                fillColor: theme.palette.canvas.main,
                strokeWidth: theme.custom.maxgraph.loopIcon.strokeWidth,
                strokeColor: theme.palette.canvas.contrastText,
                fontColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.loopIcon.fontSize,
                resizable: true,
                editable: false,
            }
        };
    }
}
