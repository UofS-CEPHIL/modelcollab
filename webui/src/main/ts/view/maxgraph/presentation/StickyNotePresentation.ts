import FirebaseStickyNote from "../../../data/components/FirebaseStickyNote";
import { Cell, VertexParameters } from "@maxgraph/core";
import TextComponentPresentation from "./TextComponentPresentation";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";

export default class StickyNotePresentation
    extends TextComponentPresentation<FirebaseStickyNote>
{

    protected makeVertexParameters(
        parent: Cell,
        component: FirebaseStickyNote,
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
                whiteSpace: "wrap",
                editable: !isInner,
                movable: !isInner,
                resizable: !isInner,
            }
        }
    }
}
