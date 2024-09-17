import { CellStyle } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../../../../data/components/FirebaseCausalLoopLink";
import { theme } from "../../../../../../Themes";
import CausalLoopLinkShape from "./CausalLoopLinkShape";
import PointerComponentPresentation from "../../../../../maxgraph/presentation/PointerComponentPresentation";

export default class CausalLoopLinkPresentation
    extends PointerComponentPresentation<FirebaseCausalLoopLink> {

    protected getDefaultStyle(isInner: boolean = false): CellStyle {
        return CausalLoopLinkPresentation.getEdgeStyle(isInner);
    }

    public static getEdgeStyle(isInner: boolean = false): CellStyle {
        return {
            shape: CausalLoopLinkShape.CLD_LINK_NAME,
            endArrow: theme.custom.maxgraph.cldLink.endArrow,
            strokeColor: theme.palette.primary.main,
            strokeWidth: theme.custom.maxgraph.cldLink.strokeWidthPx,
            endSize: theme.custom.maxgraph.cldLink.endSizePx,
            curved: true,
            edgeStyle: theme.custom.maxgraph.cldLink.edgeStyle,
            fontSize: theme.custom.maxgraph.cldLink.fontSize,
            fontColor: theme.palette.primary.main,
            fontStyle: 3,
            labelBackgroundColor: theme.palette.background.default,
            labelWidth: 20,
            editable: false,
            bendable: !isInner,
            movable: !isInner,
            resizable: !isInner,
        };
    }
}
