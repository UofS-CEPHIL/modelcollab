import { CellStyle } from "@maxgraph/core";
import FirebaseStock from "../../../../../../data/components/FirebaseStock";
import { theme } from "../../../../../../Themes";
import TextComponentPresentation from "../../../../../maxgraph/presentation/TextComponentPresentation";

export default class StockPresentation
    extends TextComponentPresentation<FirebaseStock>
{
    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return StockPresentation.getVertexStyle(isInner);
    }

    public static getVertexStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "rectangle",
            fillColor: theme.palette.canvas.main,
            rounded: theme.custom.maxgraph.stock.rounded,
            strokeWidth: theme.custom.maxgraph.stock.strokeWidth,
            strokeColor: theme.palette.canvas.contrastText,
            fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
            fontColor: theme.palette.canvas.contrastText,
            whiteSpace: "wrap",
            movable: !isInner,
            resizable: !isInner,
            editable: !isInner,
        };
    }
}
