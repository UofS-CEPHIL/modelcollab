import { Cell, ChildChange, EventObject, Geometry, GeometryChange, StyleChange, TerminalChange, UndoableChange, UndoManager, ValueChange } from "@maxgraph/core";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import MCGraph from "./MCGraph";
import ComponentPresentation from "./presentation/ComponentPresentation";

export default class UndoHandler {

    private graph: MCGraph;
    private firebaseDataModel: FirebaseDataModel;
    private undoManager: UndoManager;
    private presentation: ComponentPresentation<FirebaseComponent>;
    private modelUuid: string;
    private getCurrentComponents: () => FirebaseComponent[];
    private keydownCellExists: () => boolean;
    private isFirst: boolean;

    public constructor(
        graph: MCGraph,
        firebaseDataModel: FirebaseDataModel,
        undoManager: UndoManager,
        presentation: ComponentPresentation<FirebaseComponent>,
        modelUuid: string,
        getCurrentComponents: () => FirebaseComponent[],
        keydownCellExists: () => boolean,
    ) {
        this.graph = graph;
        this.firebaseDataModel = firebaseDataModel;
        this.undoManager = undoManager;
        this.presentation = presentation;
        this.modelUuid = modelUuid;
        this.getCurrentComponents = getCurrentComponents;
        this.keydownCellExists = keydownCellExists;
        this.isFirst = true;
    }

    // The user commanded us to do an undo or redo -- perform the changes
    public onUndoOrRedo(_: EventTarget, event: EventObject): void {
        const edit = event.getProperty("edit");
        this.handleChanges(edit.changes);
    }

    // An undoable event happened -- decide whether to add it to the manager
    public onUndoableEvent(_: EventTarget, event: EventObject): void {
        // Don't let users undo the initial add of components to the graph
        if (!this.isFirst && this.isSignificantEvent(event)) {
            this.undoManager.undoableEditHappened(event.getProperty("edit"));
        }
        this.isFirst = false;
    }

    private isSignificantEvent(e: EventObject): boolean {
        const edit = e.getProperty("edit");
        const changes: UndoableChange[] = edit ? edit.changes : [];
        for (const c of changes) {
            if (c instanceof StyleChange) {
                if (this.isSignificantStyleChange(c)) return true;
            }
            else if (c instanceof GeometryChange) {
                if (this.isSignificantGeometryChange(c)) return true;
            }
            else if (c instanceof ValueChange) {
                if (this.isSignificantValueChange(c)) return true;
            }
            else if (c instanceof ChildChange) {
                if (this.isSignificantChildChange(c)) return true;
            }
            else if (c instanceof TerminalChange) {
                if (this.isSignificantTerminalChange(c)) return true;
            }
            else {
                return true;
            }
        }
        return false;
    }

    private isSignificantCell(cell: Cell): boolean {
        return cell.getValue() instanceof FirebaseComponentBase<any>;
    }

    private isSignificantStyleChange(change: StyleChange): boolean {
        if (!this.isSignificantCell(change.cell)) return false;
        return change.style.entryX !== change.previous.entryX
            || change.style.entryY !== change.previous.entryY
            || change.style.exitX !== change.previous.entryX
            || change.style.exitY !== change.previous.entryY;
    }

    private arePointsEqual(a: Geometry, b: Geometry): boolean {
        if (a.points === null && b.points === null) return true;
        if (a.points === null || b.points === null) return false;
        if (a.points.length !== b.points.length) return false;
        return a.points.every((p, i) => p.equals(b.points![i]));
    }

    private isSignificantGeometryChange(change: GeometryChange): boolean {
        if (change.geometry === null || change.previous === null)
            return false;
        if (this.keydownCellExists()) return false;
        if (!this.isSignificantCell(change.cell)) return false;
        return change.geometry.x !== change.previous.x
            || change.geometry.y !== change.previous.y
            || change.geometry.height !== change.previous.height
            || change.geometry.width !== change.previous.width
            || !this.arePointsEqual(change.geometry, change.previous);
    }

    private isSignificantValueChange(change: ValueChange): boolean {
        if (!this.isSignificantCell(change.cell)) return false;
        return change.value instanceof FirebaseComponentBase<any>
            && change.previous instanceof FirebaseComponentBase<any>
            && !change.value.equals(change.previous);
    }

    private isSignificantChildChange(change: ChildChange): boolean {
        return this.isSignificantCell(change.child);
    }

    private isSignificantTerminalChange(change: TerminalChange): boolean {
        return this.isSignificantCell(change.cell);
    }

    private handleChanges(changes: UndoableChange[]): void {
        type UpdateChange = GeometryChange | ValueChange | StyleChange;
        function isUpdateChange(c: UndoableChange): boolean {
            return c instanceof GeometryChange
                || c instanceof ValueChange
                || c instanceof StyleChange;
        }
        function isUnusedChange(c: UndoableChange): boolean {
            return !isUpdateChange(c) && !(c instanceof ChildChange)
        }

        var childChanges = changes
            .filter(c => c instanceof ChildChange)
            .map(c => c as ChildChange); // Dumb that we have to do this
        var updateChanges = changes
            .filter(isUpdateChange)
            .map(c => c as UpdateChange);
        var otherChanges = changes.filter(isUnusedChange);

        var updatedComponents = this.getCurrentComponents();

        // Do child changes first and ignore changes on deleted components
        for (const change of childChanges) {
            const isDeletion: boolean = !change.parent;
            const updated = change.child;
            if (isDeletion) {
                updatedComponents = updatedComponents.filter(c =>
                    c.getId() !== change.child.getId()!
                );
                updateChanges = updateChanges.filter(c =>
                    c.cell.getId() !== change.child.getId()
                );
            }
            else {
                updatedComponents.push(updated.getValue());
            }
        }
        for (const change of updateChanges) {
            const idx = this.getIdxWithIdOrThrow(
                change.cell.getId()!,
                updatedComponents
            );
            const oldComponent = updatedComponents[idx];
            updatedComponents[idx] = this.presentation
                .updateComponent(oldComponent, change.cell, this.graph);
        }
        if (otherChanges.length > 0) {
            console.error("Unexpected changes: ");
            console.error(otherChanges);
        }

        this.firebaseDataModel.setAllComponents(
            this.modelUuid,
            updatedComponents
        );
    }

    private getIdxWithIdOrThrow(
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

}
