import { CellStyle } from "@maxgraph/core";
import FirebaseLoopIcon from "../../../../../../data/components/FirebaseLoopIcon";
import { theme } from "../../../../../../Themes";
import LoopIconShape from "./LoopIconShape";
import TextComponentPresentation from "../../../../../maxgraph/presentation/TextComponentPresentation";

export default class LoopIconPresentation
    extends TextComponentPresentation<FirebaseLoopIcon>
{

    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return LoopIconPresentation.getVertexStyle(isInner);
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
            editable: !isInner,
        };
    }
}
