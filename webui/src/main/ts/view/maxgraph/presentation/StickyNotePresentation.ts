import FirebaseStickyNote from "../../../data/components/FirebaseStickyNote";
import { Cell, VertexParameters } from "@maxgraph/core";
import TextComponentPresentation from "./TextComponentPresentation";
import StockFlowGraph from "../StockFlowGraph";
import { theme } from "../../../Themes";

export default class StickyNotePresentation
    extends TextComponentPresentation<FirebaseStickyNote>
{
    public addComponent(
        component: FirebaseStickyNote,
        graph: StockFlowGraph,
        parent?: Cell,
        loadStaticModelComponents?: ((name: string) => void),
        movable: boolean = true
    ): Cell | Cell[] {
        return graph.insertVertex(this.getStickyNoteArgs(
            parent ?? graph.getDefaultParent(),
            component,
            movable
        ));
    }

    private getStickyNoteArgs(
        parent: Cell,
        component: FirebaseStickyNote,
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
                shape: "rectangle",
                fillColor: theme.custom.maxgraph.stickynote.color,
                rounded: false,
                strokeColor: theme.palette.canvas.contrastText,
                strokeWidth: theme.custom.maxgraph.stickynote.strokeWidth,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontColor: theme.palette.canvas.contrastText,
                align: "left",
                verticalAlign: "top",
                editable: true,
                whiteSpace: "wrap",
                movable
            }
        }
    }
}
