import { Cell, CellStyle, VertexParameters } from "@maxgraph/core";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import FirebaseFlow from "../../../data/components/FirebaseFlow";
import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import FirebaseStaticModel from "../../../data/components/FirebaseStaticModel";
import { theme } from "../../../Themes";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import MCGraph from "../MCGraph";
import StockFlowGraph from "../StockFlowGraph";
import PointComponentPresentation from "./PointComponentPresentation";

export default class StaticModelPresentation
    extends PointComponentPresentation<FirebaseStaticModel>
{

    public addComponent(
        component: FirebaseStaticModel,
        graph: StockFlowGraph,
        parent: Cell
    ): Cell | Cell[] {
        return super.addComponent(
            component,
            graph,
            parent,
        );
    }

    public updateCell(
        component: FirebaseStaticModel,
        cell: Cell,
        graph: StockFlowGraph,
        loadedModel?: LoadedStaticModel
    ): void {
        super.updateCell(component, cell, graph);
        // Load the inner components only if they haven't been loaded yet
        if (cell.getChildCount() === 0 && loadedModel) {
            const translated = this.translateComponentPositions(
                loadedModel.components.map(c => this.prefixId(c, component))
            );
            const newCells = graph.addComponentsInCorrectOrder(
                translated,
                cell,
            );
            const bbox = graph.getBoundingBoxFromGeometry(newCells, true);
            if (!bbox) {
                console.error(
                    "Could not compute bounding box for cells: " + newCells
                );
                return;
            }
            const newGeo = cell.getGeometry()!.clone();
            const pad = theme.custom.maxgraph.staticModel.componentPaddingPx;
            newGeo.width = bbox.width + (2 * pad);
            newGeo.height = bbox.height + (2 * pad);
            cell.setGeometry(newGeo);
        }
    }

    protected getVertexParameters(
        component: FirebaseStaticModel,
        graph: MCGraph,
        parent?: Cell,
    ): VertexParameters {
        return {
            ...super.getVertexParameters(component, graph, parent),
            width: theme.custom.maxgraph.staticModel.loadingModelWidthPx,
            height: theme.custom.maxgraph.staticModel.loadingModelWidthPx,
        };
    }

    protected getDefaultStyle(): CellStyle {
        return {
            shape: "rectangle",
            fillColor: "none",
            strokeColor: theme.custom.maxgraph.staticModel.strokeColor,
            strokeOpacity: theme.custom.maxgraph.staticModel.strokeOpacity,
            rounded: true,
            editable: theme.custom.maxgraph.staticModel.rounded,
            resizable: false,
            strokeWidth: theme.custom.maxgraph.staticModel.strokeWidthPx,
            fillOpacity: theme.custom.maxgraph.staticModel.fillOpacity,
        };
    }

    protected getStyle(component: FirebaseStaticModel): CellStyle {
        return {
            ...super.getStyle(component, false),
            fillColor: component.getData().color
        };
    }

    private translateComponentPositions(
        cpts: FirebaseComponent[]
    ): FirebaseComponent[] {
        const leftmost = Math.min(...cpts.map(
            c => c.getData().x ?? Number.POSITIVE_INFINITY
        ));
        const topmost = Math.min(...cpts.map(
            c => c.getData().y ?? Number.POSITIVE_INFINITY
        ));
        return cpts.map(c => {
            if (c instanceof FirebasePointComponent) {
                const pad =
                    theme.custom.maxgraph.staticModel.componentPaddingPx;
                const oldData = c.getData();
                return c.withData({
                    ...oldData,
                    x: oldData.x - leftmost + pad,
                    y: oldData.y - topmost + pad
                });
            }
            else if (c instanceof FirebaseFlow) {
                return this.translateFlowCloudPoints(c, leftmost, topmost);
            }
            else {
                return c;
            }
        });
    }

    private translateFlowCloudPoints(
        c: FirebaseFlow,
        dx: number,
        dy: number
    ): FirebaseFlow {
        const pad =
            theme.custom.maxgraph.staticModel.componentPaddingPx;
        const updatePoint = (p: string) => {
            const oldpoint = FirebaseFlow.extractPointFromId(p);
            return FirebaseFlow.makePoint(
                oldpoint.x - dx + pad,
                oldpoint.y - dy + pad
            );
        }
        const newData = { ...c.getData() };
        if (FirebaseFlow.isPoint(newData.from)) {
            newData.from = updatePoint(newData.from);
        }
        if (FirebaseFlow.isPoint(newData.to)) {
            newData.to = updatePoint(newData.to);
        }
        return c.withData(newData);
    }

    private prefixId(
        c: FirebaseComponent,
        sm: FirebaseStaticModel
    ): FirebaseComponent {
        c = c.withId(sm.makeChildId(c.getId()));
        if (c.getData().from !== undefined) {
            const oldData = c.getData();
            c = c.withData({
                ...oldData,
                from: FirebaseFlow.isPoint(oldData.from)
                    ? oldData.from
                    : sm.makeChildId(oldData.from),
                to: FirebaseFlow.isPoint(oldData.to)
                    ? oldData.to
                    : sm.makeChildId(oldData.to)
            });
        }
        return c;
    }
}
