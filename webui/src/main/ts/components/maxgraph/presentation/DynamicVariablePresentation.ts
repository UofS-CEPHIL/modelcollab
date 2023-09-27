import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class DynamicVariablePresentation
    implements ComponentPresentation<schema.VariableFirebaseComponent>
{
    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly DEFAULT_WIDTH_PX = 80
    public static readonly DEFAULT_HEIGHT_PX = 25
    public static readonly DEFAULT_FONT_SIZE = 14;

    public addComponent(
        dynvar: schema.VariableFirebaseComponent,
        graph: StockFlowGraph
    ) {
        graph.insertVertex(this.getGraphArgs(
            graph.getDefaultParent(),
            dynvar
        ));
    }

    private getGraphArgs(
        parent: Cell,
        dynvar: schema.VariableFirebaseComponent
    ): VertexParameters {
        return {
            parent,
            value: dynvar.getData().text,
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
                fontStyle: 3
            }
        };
    }

    // Is the given stock firebase data up-to-date with the presentation info in
    // the cell that represents it? Ignore any irrelevant data
    public isEqual(
        stock: schema.VariableFirebaseComponent,
        cell: Cell
    ): boolean {
        return false; // TODO
    }
}
