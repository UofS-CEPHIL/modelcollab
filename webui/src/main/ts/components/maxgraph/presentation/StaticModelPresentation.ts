import { Cell, VertexParameters } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import { LoadedStaticModel } from "../CanvasScreen";
import StockFlowGraph from "../StockFlowGraph";
import PointComponentPresentation from "./PointComponentPresentation";

export default class StaticModelPresentation
    extends PointComponentPresentation<schema.StaticModelFirebaseComponent> {

    public static readonly STROKE_COLOR = "Black";
    public static readonly STROKE_WIDTH_PX = 1;
    public static readonly STROKE_OPACITY = 100;
    public static readonly FILL_OPACITY = 25;
    public static readonly DEFAULT_WIDTH_PX = 100;
    public static readonly DEFAULT_HEIGHT_PX = 100;
    public static readonly COMPONENT_PADDING_PX = 15;

    public addComponent(
        component: schema.StaticModelFirebaseComponent,
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
        component: schema.StaticModelFirebaseComponent,
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
        sm: schema.StaticModelFirebaseComponent
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
        cpts: schema.FirebaseDataComponent<any>[]
    ): schema.FirebaseDataComponent<any>[] {
        const leftmost = Math.min(...cpts.map(
            c => c.getData().x ?? Number.POSITIVE_INFINITY
        ));
        const topmost = Math.min(...cpts.map(
            c => c.getData().y ?? Number.POSITIVE_INFINITY
        ));
        return cpts.map(c => {
            if (c instanceof schema.PointFirebaseComponent<any>) {
                const pad = StaticModelPresentation.COMPONENT_PADDING_PX;
                const oldData = c.getData();
                return c.withData({
                    ...oldData,
                    x: oldData.x - leftmost + pad,
                    y: oldData.y - topmost + pad
                });
            }
            else if (c instanceof schema.FlowFirebaseComponent) {
                return this.translateFlowCloudPoints(c, leftmost, topmost);
            }
            else {
                return c;
            }
        });
    }

    private translateFlowCloudPoints(
        c: schema.FlowFirebaseComponent,
        dx: number,
        dy: number
    ): schema.FlowFirebaseComponent {
        const pad = StaticModelPresentation.COMPONENT_PADDING_PX;
        const updatePoint = (p: string) => {
            const oldpoint = this.extractPoint(p);
            return this.makePoint(
                oldpoint.x - dx + pad,
                oldpoint.y - dy + pad
            );
        }
        const newData = { ...c.getData() };
        if (this.isPoint(newData.from)) {
            newData.from = updatePoint(newData.from);
        }
        if (this.isPoint(newData.to)) {
            newData.to = updatePoint(newData.to);
        }
        return c.withData(newData);
    }

    // TODO store this with firebase stuff
    private isPoint(id: string): boolean {
        return id.startsWith('p');
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
    private makePoint(x: number, y: number): string {
        return `p${x},${y}`;
    }

    private prefixId(
        c: schema.FirebaseDataComponent<any>,
        sm: schema.StaticModelFirebaseComponent
    ): schema.FirebaseDataComponent<any> {
        const addPrefix = (id: string) => sm.getId() + "/" + id;

        c = c.withId(addPrefix(c.getId()));
        if (c.getData().from !== undefined) {
            const oldData = c.getData();
            c = c.withData({
                ...oldData,
                from: this.isPoint(oldData.from)
                    ? oldData.from
                    : addPrefix(oldData.from),
                to: this.isPoint(oldData.to)
                    ? oldData.to
                    : addPrefix(oldData.to)
            });
        }
        return c;
    }
}
