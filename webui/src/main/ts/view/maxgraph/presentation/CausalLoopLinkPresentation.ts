import { Cell, EdgeParameters } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../data/components/FirebaseCausalLoopLink";
import { theme } from "../../../Themes";
import MCGraph from "../MCGraph";
import CausalLoopLinkShape from "./CausalLoopLinkShape";
import PointerComponentPresentation from "./PointerComponentPresentation";

export default class CausalLoopLinkPresentation
    extends PointerComponentPresentation<FirebaseCausalLoopLink> {

    public updateComponent(
        component: FirebaseCausalLoopLink,
        cell: Cell,
        graph?: MCGraph
    ): FirebaseCausalLoopLink {
        return component;
    }

    protected makeEdgeParameters(
        link: FirebaseCausalLoopLink,
        parent: Cell,
        source: Cell,
        target: Cell,
        movable: boolean
    ): EdgeParameters {
        return {
            parent,
            id: link.getId(),
            value: link,
            source,
            target,
            style: {
                shape: CausalLoopLinkShape.CLD_LINK_NAME,
                endArrow: theme.custom.maxgraph.cldLink.endArrow,
                strokeColor: theme.palette.primary.main,
                strokeWidth: theme.custom.maxgraph.cldLink.strokeWidthPx,
                endSize: theme.custom.maxgraph.cldLink.endSizePx,
                curved: true,
                bendable: true,
                edgeStyle: theme.custom.maxgraph.cldLink.edgeStyle,
                movable,
                fontSize: theme.custom.maxgraph.cldLink.fontSize,
                fontColor: theme.palette.primary.main,
                fontStyle: 3,
                labelBackgroundColor: theme.palette.background.default,
                labelWidth: 20,
            }
        };
    }
}
