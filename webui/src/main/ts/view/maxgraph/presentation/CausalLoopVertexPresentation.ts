import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseCausalLoopVertex from "../../../data/components/FirebaseCausalLoopVertex";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import TextComponentPresentation from "./TextComponentPresentation";

export default class CausalLoopVertexPresentation
    extends TextComponentPresentation<FirebaseCausalLoopVertex> {

    public addComponent(
        component: FirebaseCausalLoopVertex,
        graph: StockFlowGraph,
        parent: Cell = graph.getDefaultParent(),
        loadStaticModelComponents?: ((name: string) => void),
        movable: boolean = true
    ): Cell | Cell[] {
        return graph.insertVertex(this.getVertexArgs(
            parent,
            component,
            movable
        ));
    }

    private getVertexArgs(
        parent: Cell,
        component: FirebaseCausalLoopVertex,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            id: component.getId(),
            value: component,
            x: component.getData().x,
            y: component.getData().y,
            width: theme.custom.maxgraph.cldVertex.defaultWidthPx,
            height: theme.custom.maxgraph.cldVertex.defaultHeightPx,
            style: {
                shape: "rectangle",
                fillColor: theme.palette.canvas.main,
                rounded: true,
                strokeWidth: theme.custom.maxgraph.cldVertex.strokeWidth,
                strokeColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontColor: theme.palette.canvas.contrastText,
                movable,
                editable: true,
            }
        };
    }

}
