import { Cell, ChildChange, EventObject, GeometryChange, InternalEvent, Point, Rectangle, UndoableChange, ValueChange } from "@maxgraph/core";
import { FirebasePointerData } from "../../data/components/FirebaseComponent";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import FirebasePointComponent from "../../data/components/FirebasePointComponent";
import FirebaseRectangleComponent from "../../data/components/FirebaseRectangleComponent";
import FirebaseDataModel from '../../data/FirebaseDataModel';
import MCGraph from "./MCGraph";
import ComponentPresentation from "./presentation/ComponentPresentation";
import { CausalLoopLinkEdgeHandler } from "./CausalLoopGraph";
import FirebaseCausalLoopLink from "../../data/components/FirebaseCausalLoopLink";

// This class contains the logic for making changes to the diagram, including
// the positions of the components and their values.
//
// Actions are almost always performed by first updating Firebase and allowing
// the change to propagate via the listeners. The only exceptions to this are
// ones that must be triggered by performing actions on individual graph cells,
// such as moving or resizing an existing component. In such cases, we set up
// listeners for the event and update Firebase within them.
export default abstract class DiagramActions<G extends MCGraph> {

    protected fbData: FirebaseDataModel;
    protected graph: G;
    protected modelUuid: string;
    protected getCurrentComponents: () => FirebaseComponent[];
    protected presentation: ComponentPresentation<FirebaseComponent>;

    public constructor(
        fbData: FirebaseDataModel,
        presentation: ComponentPresentation<FirebaseComponent>,
        graph: G,
        modelUuid: string,
        getCurrentComponents: () => FirebaseComponent[],
    ) {
        this.fbData = fbData;
        this.presentation = presentation;
        this.graph = graph;
        this.modelUuid = modelUuid;
        this.getCurrentComponents = getCurrentComponents;

        // Listen for graph actions and update Firebase when they happen. This
        // is only for actions that don't originate from "UserControls" and
        // instead come from the graph directly, such as cells moved or resized.
        this.graph.addListener(
            InternalEvent.CELLS_MOVED,
            (s: EventSource, o: EventObject) => this.onCellsMoved(s, o)
        );
        this.graph.addListener(
            InternalEvent.CELLS_RESIZED,
            (s: EventSource, o: EventObject) => this.onCellsResized(s, o)
        );
        this.graph.addListener(
            CausalLoopLinkEdgeHandler.EDGE_POINTS,
            (s: EventSource, o: EventObject) => this.onCellPointsEdited(s, o)
        );
    }

    public addComponent(component: FirebaseComponent): void {
        // "update" and "add" are the same thing in Firebase
        this.updateComponent(component);
    }

    public updateComponent(component: FirebaseComponent): void {
        this.fbData.updateComponent(this.modelUuid, component);
    }

    public handleChanges(changes: UndoableChange[]): void {
        const updatedComponents = this.getCurrentComponents();
        for (const change of changes) {
            if (
                change instanceof GeometryChange
                || change instanceof ValueChange
            ) {
                const idx = this.getIdxWithIdOrThrow(
                    change.cell.getId()!,
                    updatedComponents
                );
                const oldComponent = updatedComponents[idx];
                updatedComponents[idx] = this.presentation
                    .updateComponent(oldComponent, change.cell, this.graph);
            }
            else if (change instanceof ChildChange) {
                const isDeletion: boolean = !change.parent;
                const updated = change.child;
                if (isDeletion) {
                    const idx = this.getIdxWithIdOrThrow(
                        updated.getId()!,
                        updatedComponents
                    );
                    updatedComponents.splice(idx, 1);
                }
                else {
                    updatedComponents.push(updated.getValue());
                }
            }
            else {
                console.error("Unknown change type occurred: " + change);
            }
        }
        this.fbData.setAllComponents(this.modelUuid, updatedComponents);
    }

    public deleteSelection(): void {
        const selectedComponents = this.graph!.getSelectionCells();
        if (selectedComponents.length > 0) {
            const selectedIds = selectedComponents.map(c => c.getId()!);
            const allComponents = this.getCurrentComponents();
            const orphans = this.findOrphanedArrowIds(
                selectedIds,
                allComponents
            );
            this.fbData.removeComponents(
                this.modelUuid,
                [...selectedIds, ...orphans],
                allComponents
            );
        }
    }

    public deleteComponent(
        component: FirebaseComponent | string
    ): void {
        if (component instanceof FirebaseComponentBase<any>) {
            component = component.getId();
        }
        this.fbData.removeComponent(this.modelUuid, component);
    }

    protected onCellsMoved(_: EventSource, event: EventObject): void {
        const dx = event.properties["dx"];
        const dy = event.properties["dy"];
        const cells: Cell[] = event.properties["cells"];
        const updatedComponents = cells
            .map(c => c.getId()!)
            .map(id => this.getComponentWithIdOrThrow(id));


        const allComponents = this.getCurrentComponents();
        const verticesToUpdate = updatedComponents.filter(
            c => c instanceof FirebasePointComponent
        );

        const others = allComponents.filter(
            c => !verticesToUpdate.find(v => v.getId() === c.getId())
        );
        const updatedVertices = verticesToUpdate.map(v =>
            (v as FirebasePointComponent<any>)
                .withUpdatedLocation(dx, dy)
        );
        this.fbData.setAllComponents(
            this.modelUuid,
            [...updatedVertices, ...others]
        );
    }

    protected onCellsResized(_: EventSource, event: EventObject): void {
        const cells: Cell[] = event.properties["cells"];
        const allComponents = this.getCurrentComponents();
        const updated: FirebaseRectangleComponent<any>[] = cells.map(c =>
            (
                this.getComponentWithId(
                    c.getValue().getId(),
                    allComponents
                ) as FirebaseRectangleComponent<any>
            ).withUpdatedSize(c.geometry!.width, c.geometry!.height)
        );
        const others = allComponents.filter(
            c => !updated.find(v => v.getId() === c.getId())
        );
        this.fbData.setAllComponents(
            this.modelUuid,
            [...updated, ...others]
        );

    }

    protected onCellPointsEdited(_: EventSource, event: EventObject): void {
        const points: Point[] = event.getProperty("points") ?? [];
        const cell: Cell = event.getProperty("cell");
        const entryX: number = event.getProperty("entryX");
        const entryY: number = event.getProperty("entryY");
        const exitX: number = event.getProperty("exitX");
        const exitY: number = event.getProperty("exitY");
        if (
            cell.getValue() instanceof FirebaseCausalLoopLink
            && !cell.getValue()
                .pointsEqual(points, entryX, entryY, exitX, exitY)
        ) {
            this.updateComponent(
                cell
                    .getValue()
                    .withPoints(points, entryX, entryY, exitX, exitY)
            );
        }
    }

    protected getComponentWithId(
        id: string,
        currentComponents?: FirebaseComponent[]
    ): FirebaseComponent | undefined {
        if (!currentComponents) currentComponents = this.getCurrentComponents();
        return currentComponents.find(c => c.getId() === id);
    }

    protected getComponentWithIdOrThrow(
        id: string,
        currentComponents?: FirebaseComponent[]
    ): FirebaseComponent {
        const ret = this.getComponentWithId(id, currentComponents);
        if (!ret) throw new Error("Can't find component with id " + id);
        return ret;
    }

    protected getIdxWithIdOrThrow(
        id: string,
        components: FirebaseComponent[]
    ): number {
        const componentIdx = components.findIndex(c => c.getId() === id);
        if (componentIdx < 0) {
            throw new Error(
                "Can't find component with id " + id
            );
        }
        return componentIdx;
    }

    protected findOrphanedArrowIds(
        deletedIds: string[],
        allComponents: FirebaseComponent[]
    ): string[] {
        function isOrphaned(c: FirebaseComponent): boolean {

            return (c.getData().from && deletedIds.includes(c.getData().from))
                || (c.getData().to && deletedIds.includes(c.getData().to));
        }

        return allComponents
            .filter(isOrphaned)
            .map(c => c.getId());
    }
}
