import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseStock from "../../../data/components/FirebaseStock";
import { theme } from "../../../Themes";
import TextComponentPresentation from "./TextComponentPresentation";

export default class StockPresentation
    extends TextComponentPresentation<FirebaseStock>
{
    protected makeVertexParameters(
        parent: Cell,
        stock: FirebaseStock,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            id: stock.getId(),
            value: stock,
            x: stock.getData().x,
            y: stock.getData().y,
            width: stock.getData().width,
            height: stock.getData().height,
            style: {
                shape: "rectangle",
                fillColor: theme.palette.canvas.main,
                rounded: true,
                strokeWidth: theme.custom.maxgraph.stock.strokeWidth,
                strokeColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontColor: theme.palette.canvas.contrastText,
                movable,
            }
        };
    }
}
