import { CellStyle } from "@maxgraph/core";
import FirebaseDynamicVariable from "../../../data/components/FirebaseDynamicVariable";
import { theme } from "../../../Themes";
import TextComponentPresentation from "./TextComponentPresentation";

export default class DynamicVariablePresentation
    extends TextComponentPresentation<FirebaseDynamicVariable>
{

    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return DynamicVariablePresentation.getVertexStyle(isInner);
    }

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "label",
            image: "/icons/variable-icon.png",
            imageWidth: theme.custom.maxgraph.icons.sizePx,
            imageHeight: theme.custom.maxgraph.icons.sizePx,
            fillColor: theme.palette.canvas.main,
            strokeColor: theme.custom.maxgraph.dynvar.strokeColor,
            strokeWidth: theme.custom.maxgraph.dynvar.strokeWidth,
            fontColor: theme.palette.canvas.contrastText,
            fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
            dashed: theme.custom.maxgraph.dynvar.dashed,
            spacingLeft: theme.custom.maxgraph.textComponent.defaultPadding,
            whiteSpace: "wrap",
            movable: !isInner,
            editable: !isInner,
            resizable: !isInner,
        };
    }

    public hasVisibleStroke(_: FirebaseDynamicVariable): boolean {
        return false;
    }
}
