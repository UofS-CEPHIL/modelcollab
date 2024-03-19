import { Cell, EdgeParameters, Point } from "@maxgraph/core";
import FirebaseCausalLoopLink from "../../../data/components/FirebaseCausalLoopLink";
import { theme } from "../../../Themes";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class CausalLoopLinkPresentation
    implements ComponentPresentation<FirebaseCausalLoopLink> {

    public addComponent(
        component: FirebaseCausalLoopLink,
        graph: MCGraph,
        parent?: Cell | undefined,
        loadStaticModelComponents?: ((name: string) => void) | undefined,
        movable: boolean = true
    ): Cell | Cell[] {
        const source = graph.getCellWithIdOrThrow(component.getData().from);
        const target = graph.getCellWithIdOrThrow(component.getData().to);


        const e = graph.insertEdge(
            this.makeLinkArgs(
                component,
                parent ?? graph.getDefaultParent(),
                source,
                target,
                component.getId(),
                movable
            )
        );

        return e;
    }

    public updateCell(
        component: FirebaseCausalLoopLink,
        cell: Cell,
        graph: MCGraph,
        loadedModels?: LoadedStaticModel[]
    ): void {
        cell.setValue(component);
    }

    public updateComponent(
        component: FirebaseCausalLoopLink,
        cell: Cell,
        graph?: MCGraph
    ): FirebaseCausalLoopLink {
        return component; // Nothing happens for now. TODO
    }

    private makeLinkArgs(
        link: FirebaseCausalLoopLink,
        parent: Cell,
        source: Cell,
        target: Cell,
        id: string,
        movable: boolean
    ): EdgeParameters {
        return {
            parent,
            id,
            value: link,
            source,
            target,
            style: {
                shape: 'cldLink',
                endArrow: theme.custom.maxgraph.cldLink.endArrow,
                strokeColor: theme.palette.primary.main,
                strokeWidth: theme.custom.maxgraph.cldLink.strokeWidthPx,
                curved: true,
                bendable: true,
                edgeStyle: theme.custom.maxgraph.cldLink.edgeStyle,
                movable,
                fontSize: theme.custom.maxgraph.cldLink.fontSize,
                fontColor: theme.palette.primary.main,
                fontStyle: 3,
                labelBackgroundColor: theme.palette.background.default,
            }
        };
    }

}
