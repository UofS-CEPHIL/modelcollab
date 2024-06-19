import { CellStyle } from "@maxgraph/core";
import FirebaseSumVariable from "../../../data/components/FirebaseSumVariable";
import { theme } from "../../../Themes";
import TextComponentPresentation from "./TextComponentPresentation";

export default class SumVariablePresentation
    extends TextComponentPresentation<FirebaseSumVariable>
{

    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return SumVariablePresentation.getVertexStyle(isInner);
    }

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "label",
            image: "/icons/sumvar-icon.png",
            imageWidth: theme.custom.maxgraph.icons.sizePx,
            imageHeight: theme.custom.maxgraph.icons.sizePx,
            fillColor: theme.palette.canvas.main,
            strokeColor: theme.palette.canvas.contrastText,
            strokeWidth: theme.custom.maxgraph.sumvar.strokeWidth,
            fontColor: theme.palette.canvas.contrastText,
            fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
            spacingLeft: theme.custom.maxgraph.textComponent.defaultPadding,
            align: theme.custom.maxgraph.textComponent.defaultAlignValue,
            dashed: theme.custom.maxgraph.sumvar.dashed,
            whiteSpace: "wrap",
            movable: !isInner,
            editable: !isInner,
            resizable: !isInner,
        };
    }
}
