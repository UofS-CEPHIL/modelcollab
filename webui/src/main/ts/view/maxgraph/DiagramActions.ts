import { Cell, ChildChange, EventObject, GeometryChange, InternalEvent, UndoableChange, ValueChange } from "@maxgraph/core";
import ComponentType from "../../data/components/ComponentType";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import FirebasePointComponent from "../../data/components/FirebasePointComponent";
import FirebaseDataModel from '../../data/FirebaseDataModel';
import MCGraph from "./MCGraph";
import ComponentPresentation from "./presentation/ComponentPresentation";

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

    protected abstract getPresentation<T extends FirebaseComponent>(
        cpt: T
    ): ComponentPresentation<T>;

    public constructor(
        fbData: FirebaseDataModel,
        graph: G,
        modelUuid: string,
        getCurrentComponents: () => FirebaseComponent[],
    ) {
        this.fbData = fbData;
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
            () => null // TODO
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
                updatedComponents[idx] = this.getPresentation(oldComponent)
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
        function isArrow(c: FirebaseComponent): boolean {
            return [ComponentType.CONNECTION, ComponentType.FLOW]
                .includes(c.getType());
        }
        function isOrphaned(c: FirebaseComponent): boolean {
            return deletedIds.includes(c.getData().from)
                || deletedIds.includes(c.getData().to);
        }

        return allComponents
            .filter(isArrow)
            .filter(isOrphaned)
            .map(c => c.getId());
    }
}
