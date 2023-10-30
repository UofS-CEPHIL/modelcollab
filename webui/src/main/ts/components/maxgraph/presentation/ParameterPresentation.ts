import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class ParameterPresentation
    extends TextComponentPresentation<schema.ParameterFirebaseComponent>
{
    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly DEFAULT_WIDTH_PX = 80
    public static readonly DEFAULT_HEIGHT_PX = 25
    public static readonly DEFAULT_FONT_SIZE = 14;

    public addComponent(
        param: schema.ParameterFirebaseComponent,
        graph: StockFlowGraph
    ) {
        graph.insertVertex(this.getGraphArgs(
            graph.getDefaultParent(),
            param
        ));
    }

    private getGraphArgs(
        parent: Cell,
        param: schema.ParameterFirebaseComponent
    ): VertexParameters {
        return {
            parent,
            id: param.getId(),
            value: param.getData().text,
            position: [param.getData().x, param.getData().y],
            width: ParameterPresentation.DEFAULT_WIDTH_PX,
            height: ParameterPresentation.DEFAULT_HEIGHT_PX,
            style: {
                shape: "text",
                fillColor: ParameterPresentation.FILL_COLOUR,
                strokeColor: ParameterPresentation.STROKE_COLOUR,
                fontColor: ParameterPresentation.STROKE_COLOUR,
                fontSize: ParameterPresentation.DEFAULT_FONT_SIZE,
                fontStyle: 2
            }
        };
    }
}
