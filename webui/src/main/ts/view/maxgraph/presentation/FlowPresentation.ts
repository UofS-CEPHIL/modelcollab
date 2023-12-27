import { Cell, EdgeParameters, VertexParameters } from "@maxgraph/core";
import FirebaseFlow from "../../../data/components/FirebaseFlow";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class FlowPresentation
    implements ComponentPresentation<FirebaseFlow>
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
            const point = FirebaseFlow.extractPoint(component.getData().from);
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
            const point = FirebaseFlow.extractPoint(component.getData().to);
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

        newComponents.push(
            graph.insertEdge(
                this.makeFlowArgs(
                    component,
                    parent ?? graph.getDefaultParent(),
                    source,
                    target,
                    component.getId(),
                    movable
                )
            )
        );
        return newComponents;
    }

    public updateCell(
        flow: FirebaseFlow,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        const flowFrom = flow.getData().from;
        const flowTo = flow.getData().to;
        if (FirebaseFlow.isPoint(flowFrom)) {
            this.updateCloud(
                FirebaseFlow.extractPoint(flowFrom),
                cell.getTerminal(true)!,
                graph
            );
        }
        if (FirebaseFlow.isPoint(flowTo)) {
            this.updateCloud(
                FirebaseFlow.extractPoint(flowTo),
                cell.getTerminal(false)!,
                graph
            );
        }
        cell.setValue(flow);
    }

    public updateComponent(
        component: FirebaseFlow,
        cell: Cell
    ): FirebaseFlow {
        throw new Error("Not Implemented");
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

    private makeFlowArgs(
        flow: FirebaseFlow,
        parent: Cell,
        fr: Cell,
        to: Cell,
        id: string,
        movable: boolean
    ): EdgeParameters {
        return {
            parent,
            id,
            value: flow,
            source: fr,
            target: to,
            style: {
                shape: theme.custom.maxgraph.flow.shape,
                strokeColor: theme.palette.canvas.contrastText,
                strokeWidth: theme.custom.maxgraph.flow.strokeWidthPx,
                fillColor: theme.palette.canvas.main,
                fontColor: theme.palette.canvas.contrastText,
                fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
                fontStyle: 1,
                curved: false,
                bendable: true,
                edgeStyle: theme.custom.maxgraph.flow.edgeStyle,
                movable,
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
            value: FlowPresentation.CLOUD_VALUE,
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
