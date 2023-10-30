import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class SumVariablePresentation
    extends TextComponentPresentation<schema.SumVariableFirebaseComponent>
{
    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly DEFAULT_WIDTH_PX = 80
    public static readonly DEFAULT_HEIGHT_PX = 25
    public static readonly DEFAULT_FONT_SIZE = 14;

    public addComponent(
        sumvar: schema.SumVariableFirebaseComponent,
        graph: StockFlowGraph
    ) {
        graph.insertVertex(this.getGraphArgs(
            graph.getDefaultParent(),
            sumvar
        ));
    }

    private getGraphArgs(
        parent: Cell,
        sumvar: schema.SumVariableFirebaseComponent
    ): VertexParameters {
        return {
            parent,
            id: sumvar.getId(),
            value: sumvar.getData().text,
            x: sumvar.getData().x,
            y: sumvar.getData().y,
            width: SumVariablePresentation.DEFAULT_WIDTH_PX,
            height: SumVariablePresentation.DEFAULT_HEIGHT_PX,
            style: {
                shape: "text",
                fillColor: SumVariablePresentation.FILL_COLOUR,
                strokeColor: SumVariablePresentation.STROKE_COLOUR,
                fontColor: SumVariablePresentation.STROKE_COLOUR,
                fontSize: SumVariablePresentation.DEFAULT_FONT_SIZE,
                fontStyle: 1
            }
        };
    }
}
