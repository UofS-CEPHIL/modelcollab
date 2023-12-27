import { Cell, VertexParameters } from "@maxgraph/core";
import FirebaseComponent from "../../../data/components/FirebaseComponent";
import FirebaseFlow from "../../../data/components/FirebaseFlow";
import FirebasePointComponent from "../../../data/components/FirebasePointComponent";
import FirebaseStaticModel from "../../../data/components/FirebaseStaticModel";
import { LoadedStaticModel } from "../../Screens/StockFlowScreen";
import StockFlowGraph from "../StockFlowGraph";
import PointComponentPresentation from "./PointComponentPresentation";

export default class StaticModelPresentation
    extends PointComponentPresentation<FirebaseStaticModel>
{

    public static readonly STROKE_COLOR = "Black";
    public static readonly STROKE_WIDTH_PX = 1;
    public static readonly STROKE_OPACITY = 100;
    public static readonly FILL_OPACITY = 25;
    public static readonly DEFAULT_WIDTH_PX = 100;
    public static readonly DEFAULT_HEIGHT_PX = 100;
    public static readonly COMPONENT_PADDING_PX = 15;

    public addComponent(
        component: FirebaseStaticModel,
        graph: StockFlowGraph,
        parent: Cell,
        loadStaticModelComponents: (name: string) => void
    ): Cell {
        loadStaticModelComponents(component.getData().modelId);
        return graph.insertVertex(this.getOuterStaticModelArgs(
            parent,
            component
        ));
    }

    public updateCell(
        component: FirebaseStaticModel,
        cell: Cell,
        graph: StockFlowGraph,
        loadedModels: LoadedStaticModel[]
    ): void {
        super.updateCell(component, cell, graph, loadedModels);
        const loadedModel =
            loadedModels.find(m => m.modelId === component.getData().modelId);
        // Load the inner components only if they haven't been loaded yet
        if (cell.getChildCount() === 0 && loadedModel) {
            const translated = this.translateComponentPositions(
                loadedModel.components.map(c => this.prefixId(c, component))
            );
            const newCells = graph.addComponentsInCorrectOrder(
                translated,
                cell,
                false
            );
            const bbox = graph.getBoundingBoxFromGeometry(newCells, true);
            if (!bbox) {
                console.error(
                    "Could not compute bounding box for cells: " + newCells
                );
                return;
            }
            const newGeo = cell.getGeometry()!.clone();
            const pad = StaticModelPresentation.COMPONENT_PADDING_PX;
            newGeo.width = bbox.width + (2 * pad);
            newGeo.height = bbox.height + (2 * pad);
            cell.setGeometry(newGeo);
        }
    }

    private getOuterStaticModelArgs(
        parent: Cell,
        sm: FirebaseStaticModel
    ): VertexParameters {
        return {
            parent,
            value: sm,
            id: sm.getId(),
            x: sm.getData().x,
            y: sm.getData().y,
            width: StaticModelPresentation.DEFAULT_WIDTH_PX,
            height: StaticModelPresentation.DEFAULT_HEIGHT_PX,
            style: {
                shape: "rectangle",
                fillColor: sm.getData().color,
                strokeColor: StaticModelPresentation.STROKE_COLOR,
                strokeOpacity: StaticModelPresentation.STROKE_OPACITY,
                rounded: true,
                strokeWidth: StaticModelPresentation.STROKE_WIDTH_PX,
                fillOpacity: StaticModelPresentation.FILL_OPACITY
            }
        }
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
                const pad = StaticModelPresentation.COMPONENT_PADDING_PX;
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
        const pad = StaticModelPresentation.COMPONENT_PADDING_PX;
        const updatePoint = (p: string) => {
            const oldpoint = FirebaseFlow.extractPoint(p);
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
        const addPrefix = (id: string) => sm.getId() + "/" + id;

        c = c.withId(addPrefix(c.getId()));
        if (c.getData().from !== undefined) {
            const oldData = c.getData();
            c = c.withData({
                ...oldData,
                from: FirebaseFlow.isPoint(oldData.from)
                    ? oldData.from
                    : addPrefix(oldData.from),
                to: FirebaseFlow.isPoint(oldData.to)
                    ? oldData.to
                    : addPrefix(oldData.to)
            });
        }
        return c;
    }
}
