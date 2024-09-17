import { Cell, CellStyle, VertexParameters } from "@maxgraph/core";
import FirebaseFlow from "../../../../../../data/components/FirebaseFlow";
import { theme } from "../../../../../../Themes";
import MCGraph from "../../../../../maxgraph/MCGraph";
import StockFlowGraph from "../StockFlowGraph";
import FlowShape from "./FlowShape";
import PointerComponentPresentation from "../../../../../maxgraph/presentation/PointerComponentPresentation";
import TextComponentPresentation from "../../../../../maxgraph/presentation/TextComponentPresentation";

export default class FlowPresentation
    extends PointerComponentPresentation<FirebaseFlow>
{

    public static readonly CLOUD_VALUE = "cloud";

    public addComponent(
        component: FirebaseFlow,
        graph: StockFlowGraph,
        parent?: Cell,
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
            const point = FirebaseFlow
                .extractPointFromId(component.getData().from);
            source = graph.insertVertex(
                this.makeCloudArgs(
                    parent ?? graph.getDefaultParent(),
                    point.x,
                    point.y,
                    FirebaseFlow.makeCloudId(component.getId(), true),
                    graph
                )
            );
            newComponents.push(source);
        }
        if (!target) {
            const point = FirebaseFlow
                .extractPointFromId(component.getData().to);
            target = graph.insertVertex(
                this.makeCloudArgs(
                    parent ?? graph.getDefaultParent(),
                    point.x,
                    point.y,
                    FirebaseFlow.makeCloudId(component.getId(), false),
                    graph
                )
            );
            newComponents.push(target);
        }

        var newCell = super.addComponent(
            component,
            graph,
            parent,
            source,
            target
        );

        if (newCell instanceof Cell) {
            newCell = [newCell];
        }

        // Need to wait before doing this so that the cell state has a chance to
        // be generated.
        // TODO is there a better way to do this?
        setTimeout(() => graph.updateCellLabelPosition(
            (newCell as Cell[])[0],
            component.getData().labelX,
            component.getData().labelY)
        );

        newComponents.push(...newCell);
        return newComponents;
    }

    public updateComponent(
        component: FirebaseFlow,
        cell: Cell,
        graph: MCGraph
    ): FirebaseFlow {
        const update = super.updateComponent(component, cell, graph);
        const { bold, italic, underline } = TextComponentPresentation
            .decodeFontStyle(cell.getStyle().fontStyle ?? 0);
        var labelX = component.getData().labelX
        var labelY = component.getData().labelY;

        const state = graph.getView().getState(cell);
        if (state) {
            labelX = state.absoluteOffset.x;
            labelY = state.absoluteOffset.y;
        }

        return update.withData({
            ...update.getData(),
            text: cell.getValue().getData().text,
            color:
                cell.getStyle().fontColor ?? theme.palette.canvas.contrastText,
            bold,
            italic,
            underline,
            labelX,
            labelY,
        });
    }

    public updateCell(
        flow: FirebaseFlow,
        cell: Cell,
        graph: StockFlowGraph
    ): void {
        super.updateCell(flow, cell, graph);
        const style = { ...cell.getStyle() };
        style.fontSize = flow.getData().fontSize;
        style.fontStyle = TextComponentPresentation.encodeFontStyle(
            flow.getData().bold,
            flow.getData().italic,
            flow.getData().underline
        );
        style.fontColor = flow.getData().color;
        style.strokeColor = flow.getData().color;

        graph.batchUpdate(() => {
            graph.getDataModel().setStyle(cell, style);
            if (!flow.isUninitializedLabelPosition()) {
                graph.updateCellLabelPosition(
                    cell,
                    flow.getData().labelX,
                    flow.getData().labelY
                );
            }

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
        });
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

    private makeCloudArgs(
        parent: Cell,
        x: number,
        y: number,
        id: string,
        graph: MCGraph,
    ): VertexParameters {
        const isInner = parent !== graph.getDefaultParent();
        return {
            parent,
            id,
            x,
            y,
            width: theme.custom.maxgraph.cloud.defaultWidthPx,
            height: theme.custom.maxgraph.cloud.defaultHeightPx,
            style: FlowPresentation.makeCloudStyle(isInner)
        };
    }

    public static makeCloudStyle(isInner: boolean = false): CellStyle {
        return {
            shape: "cloud",
            fillColor: theme.palette.canvas.main,
            strokeColor: theme.palette.canvas.contrastText,
            movable: !isInner,
            editable: false,
            resizable: false,
        };
    }

    public getDefaultStyle(isInner: boolean = false): CellStyle {
        return FlowPresentation.getEdgeStyle(isInner);
    }

    public getStyle(component: FirebaseFlow, isInner: boolean = false) {
        return {
            ...super.getStyle(component, isInner),
            strokeColor: component.getData().color,
            fontColor: component.getData().color,
            labelBorderColor: component.getData().color,
            fontSize: component.getData().fontSize,
            fontStyle: TextComponentPresentation.encodeFontStyle(
                component.getData().bold,
                component.getData().italic,
                component.getData().underline,
            ),
        };
    }

    public static getEdgeStyle(isInner: boolean = false): CellStyle {
        return {
            shape: FlowShape.FLOW_NAME,
            strokeColor: theme.palette.canvas.contrastText,
            strokeWidth: theme.custom.maxgraph.flow.strokeWidthPx,
            endSize: theme.custom.maxgraph.flow.endSizePx,
            fillColor: theme.palette.canvas.main,
            fontColor: theme.palette.canvas.contrastText,
            fontSize: theme.custom.maxgraph.textComponent.defaultFontSize,
            fontStyle: 0,
            curved: false,
            edgeStyle: theme.custom.maxgraph.flow.edgeStyle,
            bendable: !isInner,
            movable: !isInner,
            editable: !isInner,
            resizable: !isInner,
            labelBackgroundColor: theme.palette.canvas.main,
            labelBorderColor: theme.palette.canvas.contrastText
        };
    }
}
