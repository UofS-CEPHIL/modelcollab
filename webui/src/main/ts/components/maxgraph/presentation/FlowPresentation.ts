import { Cell, EdgeParameters, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import StockFlowGraph from "../StockFlowGraph";
import ComponentPresentation from "./ComponentPresentation";

export default class FlowPresentation
    implements ComponentPresentation<schema.FlowFirebaseComponent>
{
    public static readonly FILL_COLOUR = "White"
    public static readonly STROKE_COLOUR = "Black"
    public static readonly STROKE_WIDTH = 2;
    public static readonly DEFAULT_FONT_SIZE = 14;
    public static readonly FLOW_STROKE_WIDTH = 1.5;
    public static readonly CLOUD_DEFAULT_WIDTH_PX = 50
    public static readonly CLOUD_DEFAULT_HEIGHT_PX = 50

    public addComponent(
        component: schema.FlowFirebaseComponent,
        graph: StockFlowGraph
    ): void {

        var source: Cell;
        var target: Cell;
        if (this.isPoint(component.getData().from)) {
            // Source is a point not a stock. Add a cloud there
            const point = this.extractPoint(component.getData().from);
            source = graph.insertVertex(
                this.makeCloudArgs(
                    graph.getDefaultParent(),
                    point.x,
                    point.y,
                    this.makeCloudId(component.getId(), true)
                )
            );
        }
        else {
            source = graph.getCellWithId(component.getData().from)!;
        }

        if (this.isPoint(component.getData().to)) {
            // Target is a point not a stock. Add a cloud there
            const point = this.extractPoint(component.getData().to);
            target = graph.insertVertex(
                this.makeCloudArgs(
                    graph.getDefaultParent(),
                    point.x,
                    point.y,
                    this.makeCloudId(component.getId(), false)
                )
            );
        }
        else {
            target = graph.getCellWithId(component.getData().to)!;
        }

        graph.insertEdge(
            this.makeFlowArgs(
                graph.getDefaultParent(),
                source,
                target,
                component.getId()
            )
        );
    }

    updateComponent(
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
        cell.setValue(flow.getData().text);
    }

    public isEqual(flow: schema.FlowFirebaseComponent, cell: Cell): boolean {
        const cpntText = flow.getData().text;
        const cellText = cell.getValue();

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

    private isCloudEqual(point: { x: number, y: number }, cloud: Cell): boolean {
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
        parent: Cell,
        fr: Cell,
        to: Cell,
        id: string
    ): EdgeParameters {
        return {
            parent,
            id,
            value: "flow",
            source: fr,
            target: to,
            style: {
                shape: "arrowConnector",
                strokeColor: FlowPresentation.STROKE_COLOUR,
                strokeWidth: FlowPresentation.STROKE_WIDTH,
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

    private makeCloudArgs(
        parent: Cell,
        x: number,
        y: number,
        id: string
    ): VertexParameters {
        return {
            parent,
            id,
            value: "",
            x,
            y,
            width: FlowPresentation.CLOUD_DEFAULT_WIDTH_PX,
            height: FlowPresentation.CLOUD_DEFAULT_HEIGHT_PX,
            style: {
                shape: "cloud",
                fillColor: FlowPresentation.FILL_COLOUR,
                strokeColor: FlowPresentation.STROKE_COLOUR
            }
        };
    }
}
