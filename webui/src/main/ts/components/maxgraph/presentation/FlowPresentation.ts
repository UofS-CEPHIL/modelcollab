import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class FlowPresentation
    implements ComponentPresentation<schema.FlowFirebaseComponent>
{
    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly DEFAULT_FONT_SIZE = 14;
    public static readonly FLOW_STROKE_WIDTH = 1.5;
    public static readonly CLOUD_DEFAULT_WIDTH_PX = 50
    public static readonly CLOUD_DEFAULT_HEIGHT_PX = 50

    public addComponent(
        component: schema.FlowFirebaseComponent,
        graph: StockFlowGraph
    ): void {
        // TODO deal with clouds & stuff.
    }

    public getGraphArgs(
        parent: Cell,
        flow: schema.FlowFirebaseComponent
    ): VertexParameters {
        return {
            parent,
            value: flow.getData().text,
            id: flow.getId(),
            source,
            target,
            style: {
                shape: "arrowConnector",
                strokeColor: FlowPresentation.STROKE_COLOUR,
                strokeWidth: FlowPresentation.FLOW_STROKE_WIDTH,
                fillColor: FlowPresentation.FILL_COLOUR,
                fontColor: FlowPresentation.STROKE_COLOUR,
                fontSize: FlowPresentation.DEFAULT_FONT_SIZE,
                fontStyle: 1,
                curved: false,
                bendable: true,
                edgeStyle: 'elbowEdgeStyle',
            }
        };
    }

    // Is the given stock firebase data up-to-date with the presentation info in
    // the cell that represents it? Ignore any irrelevant data
    public isEqual(stock: schema.FlowFirebaseComponent, cell: Cell): boolean {
        return false; // TODO
    }
}
