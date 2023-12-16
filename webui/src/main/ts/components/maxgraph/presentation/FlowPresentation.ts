import { Cell, EdgeParameters, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { theme } from "../../../Themes";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class FlowPresentation
    implements ComponentPresentation<schema.FlowFirebaseComponent>
{
    public static readonly CLOUD_VALUE = "cloud";


    public addComponent(
        component: schema.FlowFirebaseComponent,
        graph: StockFlowGraph,
        parent?: Cell,
        _?: (__: string) => void,
        movable: boolean = true
    ): Cell[] {

        var source: Cell | undefined = undefined;
        var target: Cell | undefined = undefined;
        const newComponents: Cell[] = [];

        // First make sure that we can find the source and target components
        if (!this.isPoint(component.getData().from)) {
            source = graph.getCellWithId(component.getData().from);
            if (!source) {
                throw new Error(
                    "Unable to find source with id " + component.getData().from
                );
            }
        }
        if (!this.isPoint(component.getData().to)) {
            target = graph.getCellWithId(component.getData().to);
            if (!target) {
                throw new Error(
                    "Unable to find target with id " + component.getData().to
                );
            }
        }

        // Create clouds if necessary
        if (!source) {
            const point = this.extractPoint(component.getData().from);
            source = graph.insertVertex(
                this.makeCloudArgs(
                    parent ?? graph.getDefaultParent(),
                    point.x,
                    point.y,
                    this.makeCloudId(component.getId(), true),
                    movable
                )
            );
            newComponents.push(source);
        }
        if (!target) {
            const point = this.extractPoint(component.getData().to);
            target = graph.insertVertex(
                this.makeCloudArgs(
                    parent ?? graph.getDefaultParent(),
                    point.x,
                    point.y,
                    this.makeCloudId(component.getId(), false),
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
        flow: schema.FlowFirebaseComponent,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        const flowFrom = flow.getData().from;
        const flowTo = flow.getData().to;
        if (this.isPoint(flowFrom)) {
            this.updateCloud(
                this.extractPoint(flowFrom),
                cell.getTerminal(true)!,
                graph
            );
        }
        if (this.isPoint(flowTo)) {
            this.updateCloud(
                this.extractPoint(flowTo),
                cell.getTerminal(false)!,
                graph
            );
        }
        cell.setValue(flow);
    }

    public updateComponent(
        component: schema.FlowFirebaseComponent,
        cell: Cell
    ): schema.FlowFirebaseComponent {
        throw new Error("Not Implemented");
    }

    public isEqual(flow: schema.FlowFirebaseComponent, cell: Cell): boolean {
        const cpntText = flow.getData().text;
        const cellText = cell.getValue().getData().text;

        // If the source/target is a cloud, check whether it's been
        // moved. Otherwise, there's nothing to check since a flow can't change
        // its source or target stock
        const cpntFrom = flow.getData().from;
        const cpntTo = flow.getData().to;
        var fromEqual = true;
        var toEqual = true;
        if (this.isPoint(cpntFrom)) {
            fromEqual = this.isCloudEqual(
                this.extractPoint(cpntFrom),
                cell.getTerminal(true)!
            );
        }
        if (this.isPoint(cpntTo)) {
            toEqual = this.isCloudEqual(
                this.extractPoint(cpntTo),
                cell.getTerminal(false)!
            );
        }

        return cpntText === cellText && fromEqual && toEqual;
    }

    private isCloudEqual(
        point: { x: number, y: number },
        cloud: Cell
    ): boolean {
        const cellX = cloud.getGeometry()!.getPoint().x;
        const cellY = cloud.getGeometry()!.getPoint().y;
        return (point.x === cellX && point.y === cellY);
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

    // TODO store this with firebase stuff
    private extractPoint(id: string): { x: number, y: number } {
        const regex = /p(?<x>\d+),(?<y>\d+)/;
        const match = id.match(regex);
        if (!match)
            throw new Error(`Unable to extract point from string ${id}`);
        return { x: +match.groups!.x, y: +match.groups!.y };
    }

    // TODO store this with firebase stuff
    private isPoint(id: string): boolean {
        return id.startsWith('p');
    }

    // TODO store this with firebase stuff
    private makeCloudId(flowId: string, isSource: boolean): string {
        const suffix = isSource ? "from" : "to";
        return `${flowId}.${suffix}`;
    }

    private makeFlowArgs(
        flow: schema.FlowFirebaseComponent,
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
