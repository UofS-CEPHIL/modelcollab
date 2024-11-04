import { Cell, CellStyle, VertexParameters } from "@maxgraph/core";
import FirebaseStaticModel from "../../../../../../data/components/FirebaseStaticModel";
import { theme } from "../../../../../../Themes";
import { LoadedStaticModel } from "../../StockFlowScreen";
import MCGraph from "../../../../../maxgraph/MCGraph";
import StockFlowGraph from "../StockFlowGraph";
import PointComponentPresentation from "../../../../../maxgraph/presentation/PointComponentPresentation";

export default class StaticModelPresentation
    extends PointComponentPresentation<FirebaseStaticModel>
{

    public hasVisibleStroke(_: FirebaseStaticModel): boolean {
        return true;
    }

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
        staticModel: FirebaseStaticModel,
        cell: Cell,
        graph: StockFlowGraph,
        loadedModel?: LoadedStaticModel
    ): void {

        super.updateCell(staticModel, cell, graph);
        // Load the inner components only if they haven't been loaded yet
        if (cell.getChildCount() === 0 && loadedModel) {
            const pad = theme.custom.maxgraph.staticModel.componentPaddingPx;
            const children = staticModel.makeChildren(
                loadedModel.components,
                pad,
            );
            const newCells = graph.addComponentsInCorrectOrder(
                children,
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
}
