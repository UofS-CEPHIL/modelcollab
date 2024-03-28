import { Cell, EdgeParameters, VertexParameters } from "@maxgraph/core";
import FirebaseFlow from "../../../data/components/FirebaseFlow";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import PointerComponentPresentation from "./PointerComponentPresentation";

export default class FlowPresentation
    extends PointerComponentPresentation<FirebaseFlow>
{

    public static readonly CLOUD_VALUE = "cloud";

    public addComponent(
        component: FirebaseFlow,
        graph: StockFlowGraph,
        parent?: Cell,
        _?: (__: string) => void,
        movable: boolean = true
    ): Cell[] {

        var source: Cell | undefined = undefined;
        var target: Cell | undefined = undefined;
        const newComponents: Cell[] = [];

        // First make sure that we can find the source and target components
        if (!FirebaseFlow.isPoint(component.getData().from)) {
            source = graph.getCellWithId(component.getData().from);
            if (!source) {
                throw new Error(
                    "Unable to find source with id " + component.getData().from
                );
            }
        }
        if (!FirebaseFlow.isPoint(component.getData().to)) {
            target = graph.getCellWithId(component.getData().to);
            if (!target) {
                throw new Error(
                    "Unable to find target with id " + component.getData().to
                );
            }
        }

        // Create clouds if necessary
        if (!source) {
            const point = FirebaseFlow.extractPointFromId(component.getData().from);
            source = graph.insertVertex(
                this.makeCloudArgs(
                    parent ?? graph.getDefaultParent(),
                    point.x,
                    point.y,
                    FirebaseFlow.makeCloudId(component.getId(), true),
                    movable
                )
            );
            newComponents.push(source);
        }
        if (!target) {
            const point = FirebaseFlow.extractPointFromId(component.getData().to);
            target = graph.insertVertex(
                this.makeCloudArgs(
                    parent ?? graph.getDefaultParent(),
                    point.x,
                    point.y,
                    FirebaseFlow.makeCloudId(component.getId(), false),
                    movable
                )
            );
            newComponents.push(target);
        }

        var newCell = super.addComponent(
            component,
            graph,
            parent,
            _,
            movable,
            source,
            target
        );
        if (newCell instanceof Cell) {
            newCell = [newCell];
        }
        newComponents.push(...newCell);
        return newComponents;
    }

    public updateCell(
        flow: FirebaseFlow,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        super.updateCell(flow, cell, graph);
        const flowFrom = flow.getData().from;
        const flowTo = flow.getData().to;
        if (FirebaseFlow.isPoint(flowFrom)) {
            this.updateCloud(
                FirebaseFlow.extractPointFromId(flowFrom),
                cell.getTerminal(true)!,
                graph
            );
        }
        if (FirebaseFlow.isPoint(flowTo)) {
            this.updateCloud(
                FirebaseFlow.extractPointFromId(flowTo),
                cell.getTerminal(false)!,
                graph
            );
        }
    }

    private updateCloud(
        point: { x: number, y: number },
        cloud: Cell,
        graph: StockFlowGraph
    ): void {
        const newGeo = cloud.getGeometry()!.clone();
        newGeo.x = point.x;
        newGeo.y = point.y;
        graph.getDataModel().setGeometry(cloud, newGeo);
    }

    protected makeEdgeParameters(
        flow: FirebaseFlow,
        parent: Cell,
        fr: Cell,
        to: Cell,
        movable: boolean
    ): EdgeParameters {
        return {
            parent,
            id: flow.getId(),
            value: flow,
            source: fr,
            target: to,
            style: {
                shape: theme.custom.maxgraph.flow.shape,
                strokeColor: theme.palette.canvas.contrastText,
                strokeWidth: theme.custom.maxgraph.flow.strokeWidthPx,
                endSize: theme.custom.maxgraph.flow.endSizePx,
                fillColor: theme.palette.canvas.main,
                fontColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontStyle: 1,
                curved: false,
                bendable: true,
                edgeStyle: theme.custom.maxgraph.flow.edgeStyle,
                movable,
                editable: true,
                labelBackgroundColor: theme.palette.canvas.main,
            }
        };
    }

    private makeCloudArgs(
        parent: Cell,
        x: number,
        y: number,
        id: string,
        movable: boolean
    ): VertexParameters {
        return {
            parent,
            id,
            x,
            y,
            width: theme.custom.maxgraph.cloud.defaultWidthPx,
            height: theme.custom.maxgraph.cloud.defaultHeightPx,
            style: {
                shape: "cloud",
                fillColor: theme.palette.canvas.main,
                strokeColor: theme.palette.canvas.contrastText,
                movable,
            }
        };
    }
}
