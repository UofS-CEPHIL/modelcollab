import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseCausalLoopVertex from "../../../data/components/FirebaseCausalLoopVertex";
import { theme } from "../../../Themes";
import TextComponentPresentation from "./TextComponentPresentation";

export default class CausalLoopVertexPresentation
    extends TextComponentPresentation<FirebaseCausalLoopVertex> {

    protected makeVertexParameters(
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
            width: component.getData().width,
            height: component.getData().height,
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
                whiteSpace: "wrap",
            }
        };
    }
}
