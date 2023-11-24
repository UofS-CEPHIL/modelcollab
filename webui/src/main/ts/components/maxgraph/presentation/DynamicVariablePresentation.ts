import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class DynamicVariablePresentation
    extends TextComponentPresentation<schema.VariableFirebaseComponent>
{

    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly DEFAULT_WIDTH_PX = 80
    public static readonly DEFAULT_HEIGHT_PX = 25
    public static readonly DEFAULT_FONT_SIZE = 14;

    public addComponent(
        dynvar: schema.VariableFirebaseComponent,
        graph: StockFlowGraph,
        parent?: Cell,
        _?: (__: string) => void,
        movable: boolean = true
    ): Cell {
        // TODO remove the `!` after the bug in maxgraph is fixed
        return graph.insertVertex(this.getGraphArgs(
            parent ?? graph.getDefaultParent(),
            dynvar,
            !movable
        ));
    }

    private getGraphArgs(
        parent: Cell,
        dynvar: schema.VariableFirebaseComponent,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            value: dynvar,
            id: dynvar.getId(),
            x: dynvar.getData().x,
            y: dynvar.getData().y,
            width: DynamicVariablePresentation.DEFAULT_WIDTH_PX,
            height: DynamicVariablePresentation.DEFAULT_HEIGHT_PX,
            style: {
                shape: "text",
                fillColor: DynamicVariablePresentation.FILL_COLOUR,
                strokeColor: DynamicVariablePresentation.STROKE_COLOUR,
                fontColor: DynamicVariablePresentation.STROKE_COLOUR,
                fontSize: DynamicVariablePresentation.DEFAULT_FONT_SIZE,
                fontStyle: 3,
                movable
            }
        };
    }
}