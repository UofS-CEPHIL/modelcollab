import FirebaseStickyNote from "../../../data/components/FirebaseStickyNote";
import { CellStyle } from "@maxgraph/core";
import TextComponentPresentation from "./TextComponentPresentation";
import { theme } from "../../../Themes";

export default class StickyNotePresentation
    extends TextComponentPresentation<FirebaseStickyNote>
{

    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return StickyNotePresentation.getVertexStyle(isInner);
    }

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "rectangle",
            fillColor: theme.custom.maxgraph.stickynote.color,
            rounded: false,
            strokeColor: theme.palette.canvas.contrastText,
            strokeWidth: theme.custom.maxgraph.stickynote.strokeWidth,
            fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
            fontColor: theme.palette.canvas.contrastText,
            fillOpacity: theme.custom.maxgraph.stickynote.fillOpacity,
            align: "left",
            verticalAlign: "top",
            whiteSpace: "wrap",
            editable: !isInner,
            movable: !isInner,
            resizable: !isInner,
        };
    }
}
