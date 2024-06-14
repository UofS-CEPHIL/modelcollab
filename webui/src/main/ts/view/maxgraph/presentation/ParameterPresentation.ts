import { CellStyle } from "@maxgraph/core";
import TextComponentPresentation from "./TextComponentPresentation";
import { theme } from "../../../Themes";
import FirebaseParameter from "../../../data/components/FirebaseParameter";

export default class ParameterPresentation
    extends TextComponentPresentation<FirebaseParameter>
{

    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return ParameterPresentation.getVertexStyle(isInner);
    }

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "label",
            image: "/icons/param-icon.png",
            imageWidth: theme.custom.maxgraph.icons.sizePx,
            imageHeight: theme.custom.maxgraph.icons.sizePx,
            fillColor: theme.palette.canvas.main,
            strokeColor: theme.palette.canvas.contrastText,
            strokeWidth: theme.custom.maxgraph.param.strokeWidth,
            fontColor: theme.palette.canvas.contrastText,
            fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
            dashed: theme.custom.maxgraph.param.dashed,
            align: theme.custom.maxgraph.textComponent.defaultAlignValue,
            whiteSpace: "wrap",
            movable: !isInner,
            resizable: !isInner,
            editable: !isInner,
        };
    }
}
