import { Cell, CellState, ConnectionHandler, EdgeHandler, EventObject, Graph, InternalEvent, InternalMouseEvent, PanningHandler, PopupMenuHandler, RubberBandHandler, SelectionCellsHandler, SelectionHandler, TooltipHandler, UndoManager, ValueChange } from "@maxgraph/core";
import ComponentType from "../../data/components/ComponentType";
import FirebaseCausalLoopVertex from "../../data/components/FirebaseCausalLoopVertex";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import FirebasePointerComponent from "../../data/components/FirebasePointerComponent";
import FirebaseStaticModel from "../../data/components/FirebaseStaticModel";
import FirebaseSubstitution from "../../data/components/FirebaseSubstitution";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import { theme } from "../../Themes";
import { UiMode } from "../screens/canvas/UiMode";
import { ComponentErrors } from "../../validation/ModelValitador";
import { LoadedStaticModel } from "../screens/canvas/stockflow/StockFlowScreen";
import MCCellEditorHandler from "./MCCellEditorHandler";
import MCEdgeHandler from "./MCEdgeHandler";
import ComponentPresentation from "./presentation/ComponentPresentation";
import UndoHandler from "./UndoHandler";

// Parent class for graphs in ModelCollab
export default abstract class MCGraph extends Graph {

    private static readonly MAX_COMPONENT_LOAD_ATTEMPTS = 5;
    private static readonly COMPONENT_LOAD_POLL_MS = 500;
    private static readonly DEFAULT_PLUGINS = [
        MCCellEditorHandler,
        TooltipHandler,
        SelectionCellsHandler,
        PopupMenuHandler,
        ConnectionHandler,
        SelectionHandler,
        PanningHandler,
        RubberBandHandler,
    ]

    protected haveStaticModelsLoaded: boolean;
    protected lastEdgeHandler: EdgeHandler | null = null;
    protected undoManager: UndoManager;
    protected undoHandler: UndoHandler;

    protected getCurrentComponents: () => FirebaseComponent[];
    protected getSubstitutions: () => FirebaseSubstitution[];
    protected getErrors: () => ComponentErrors;
    protected getMode: () => UiMode;
    protected revalidate: () => void;
    protected presentation: ComponentPresentation<FirebaseComponent>;
    protected firebaseDataModel: FirebaseDataModel;
    protected readonly modelUuid: string;

    protected abstract registerCustomShapes(): void;

    public constructor(
        container: HTMLElement,
        firebaseDataModel: FirebaseDataModel,
        modelUuid: string,
        presentation: ComponentPresentation<FirebaseComponent>,
        getCurrentComponents: () => FirebaseComponent[],
        getSubstitutions: () => FirebaseSubstitution[],
        getErrors: () => ComponentErrors,
        revalidate: () => void,
        getMode: () => UiMode,
        keydownCellExists: () => boolean,
    ) {
        super(container, undefined, MCGraph.DEFAULT_PLUGINS);
        this.presentation = presentation;
        this.getCurrentComponents = getCurrentComponents;
        this.getSubstitutions = getSubstitutions;
        this.revalidate = revalidate;
        this.getErrors = getErrors;
        this.getMode = getMode;
        this.firebaseDataModel = firebaseDataModel;
        this.modelUuid = modelUuid;
        this.haveStaticModelsLoaded = false;

        this.setAutoSizeCells(true);
        this.setAllowDanglingEdges(false);
        this.setAllowLoops(true);
        this.setHtmlLabels(true);
        this.setEnterStopsCellEditing(true);

        this.undoManager = new UndoManager();
        this.undoHandler = new UndoHandler(
            this,
            firebaseDataModel,
            this.undoManager,
            presentation,
            modelUuid,
            getCurrentComponents,
            keydownCellExists,
        );
        this.setupUndoManager();
        this.setupSelectionHandler();
        this.setupRubberBandHandler();
        this.registerCustomShapes();
        this.setupTooltips();

        // When we undo changes to labels, this listener makes sure that they
        // get propagated to Firebase
        this.getDataModel().addListener(
            InternalEvent.EXECUTE,
            (_: EventTarget, e: EventObject) => {
                const change = e.getProperty("change");
                if (
                    change instanceof ValueChange
                    && change.value instanceof FirebaseComponentBase
                ) {
                    this.firebaseDataModel.updateComponent(
                        this.modelUuid,
                        change.value
                    );
                }
            }
        );
    }

    private setupRubberBandHandler(): void {
        const rbHandler = this.getPlugin(
            RubberBandHandler.pluginId
        ) as RubberBandHandler;
        rbHandler.fadeOut = true;
    }

    private setupSelectionHandler(): void {
        const selHandler = this.getPlugin(
            SelectionHandler.pluginId
        ) as SelectionHandler;
        selHandler.getInitialCellForEvent = (me: InternalMouseEvent) => {
            if (me.getState() && me.getState()!.cell) {
                return me.getState()!.cell;
            }
            return null;
        }
    }

    private setupTooltips(): void {
        this.setTooltips(true);
        const tooltipHandler =
            this.getPlugin("TooltipHandler") as TooltipHandler;
        const style = tooltipHandler.div.style;
        style.position = 'absolute';
        style.background = theme.palette.canvas.main;
        style.padding = '8px';
        style.border = '1px solid ' + theme.palette.text.primary;
        style.borderRadius = '5px';
        style.fontFamily = theme.typography.fontFamily || "sans-serif";
        style.fontSize = theme.typography.fontSize.toString();
    }

    private setupUndoManager(): void {
        this.getDataModel().addListener(
            InternalEvent.UNDO,
            (t: EventTarget, e: EventObject) =>
                this.undoHandler.onUndoableEvent(t, e)
        );
        this.getView().addListener(
            InternalEvent.UNDO,
            (t: EventTarget, e: EventObject) =>
                this.undoHandler.onUndoableEvent(t, e)
        );
        this.addListener(
            InternalEvent.UNDO,
            (t: EventTarget, e: EventObject) =>
                this.undoHandler.onUndoableEvent(t, e)
        );
        this.undoManager.addListener(
            InternalEvent.UNDO,
            (t: EventTarget, e: EventObject) =>
                this.undoHandler.onUndoOrRedo(t, e)
        );
        this.undoManager.addListener(
            InternalEvent.REDO,
            (t: EventTarget, e: EventObject) =>
                this.undoHandler.onUndoOrRedo(t, e)
        );
    }

    public undo(): void {
        this.undoManager.undo();
    }

    public redo(): void {
        this.undoManager.redo();
    }

    public getTooltipForCell = (cell: Cell) => {
        if (!cell.getId()) return "";
        const errs = this.getErrors()[cell.getId()!];
        if (!errs) return "";

        return errs.join('\n');
    }

    public addComponent(
        c: FirebaseComponent,
        parent: Cell = this.getDefaultParent(),
    ): Cell | Cell[] {
        return this.presentation.addComponent(c, this, parent);
    }

    public addComponentsInCorrectOrder(
        toAdd: FirebaseComponent[],
        parent: Cell = this.getDefaultParent(),
    ): Cell[] {
        const isEdge = (cpt: FirebaseComponent) =>
            [
                ComponentType.CONNECTION,
                ComponentType.CLD_LINK
            ].includes(cpt.getType());
        const isFlow = (cpt: FirebaseComponent) =>
            cpt.getType() === ComponentType.FLOW;
        const isVertex = (cpt: FirebaseComponent) =>
            !isEdge(cpt) && !isFlow(cpt);

        return [
            ...toAdd
                .filter(c => isVertex(c))
                .flatMap(vtx => this.addComponent(vtx, parent)),
            ...toAdd
                .filter(c => isFlow(c))
                .flatMap(flow => this.addComponent(flow, parent)),
            ...toAdd
                .filter(isEdge)
                .flatMap(edge => this.addComponent(edge, parent)),
        ];
    }

    // Update a cell to match the given component.
    // Call this in the middle of a batch update.
    public updateCell(c: FirebaseComponent): void {
        const cell = this.getCellWithId(c.getId())!;
        this.presentation.updateCell(c, cell, this);
    }

    public isCellType(cell: Cell, cptType: ComponentType): boolean {
        return cell.getValue() instanceof FirebaseComponentBase
            && cell.getValue().getType() === cptType;
    }

    // Delete a component. Call this in the middle of a batch update.
    public deleteComponent(
        id: string,
        allComponents: FirebaseComponent[]
    ): void {
        const cell = this.getCellWithId(id);
        if (cell) {
            if (cell.getValue().getType() === ComponentType.STATIC_MODEL) {
                this.deleteStaticModel(cell.getValue(), allComponents);
                this.revalidate();
            }
            else if (this.cellHasSubstitution(cell)) {
                const subs = this.makeSubstitutionsForAllChildren(cell);
                subs.forEach(sub => this.unapplySubstitution(sub));
                this.firebaseDataModel.unidentifyAllComponents(
                    this.modelUuid,
                    cell.getId()!
                );
            }
            this.removeCells([cell]);
        }
        else {
            console.error(
                `Attempting to remove component with id ${id} but not found`
            );
        }
    }

    public cellLabelChanged = (
        cell: Cell,
        newValue: string,
        resize: boolean = false
    ) => {
        function isSpace(s: string): boolean {
            return !/[^\s]/.test(s);
        }

        var component = cell.getValue();

        if (component instanceof FirebaseComponentBase) {
            if (
                component.getType() === ComponentType.CLD_VERTEX
                && isSpace(newValue)
            ) {
                newValue = FirebaseCausalLoopVertex.EMPTY_VERTEX_TEXT;
            }

            if (!component.getData().text) {
                throw new Error(
                    "Editing text for invalid component type: "
                    + component.getType()
                );
            }

            const newComponent = component.withData({
                ...component.getData(),
                text: newValue
            });

            this.getDataModel().setValue(cell, newComponent);
        }

        if (resize) {
            this.cellSizeUpdated(cell, false);
        }
    }

    // Override
    // Returns the string representation of a particular cell
    public convertValueToString(cell: Cell): string {
        const val = cell.getValue();
        if (val instanceof FirebaseComponentBase) {
            return val.getLabel() ?? "";
        }
        else if (val) {
            return val.toString();
        }
        else {
            return "<null>";
        }
    }

    public getCellWithId(id: string): Cell | undefined {
        return this.getAllCells().find(c => c.getId() === id);
    }

    public getCellWithIdOrThrow(id: string): Cell {
        const cell = this.getCellWithId(id);
        if (!cell) throw new Error("Can't find cell with ID " + id);
        else return cell;
    }

    public getAllCells(parent: Cell = this.getDefaultParent()): Cell[] {
        return parent
            .getChildren()
            .flatMap(c => this.getAllCells(c))
            .concat(parent.getChildren());
    }

    public getLastEdgeHandler(): EdgeHandler | null {
        return this.lastEdgeHandler;
    }

    protected showErrors(errors: ComponentErrors) {
        const isCellError = (c: Cell) =>
            c.getStyle().strokeColor === theme.palette.error.light;
        const cells = this.getAllCells();
        for (const cell of cells) {
            if (
                cell.getId() !== null
                && cell.getValue() instanceof FirebaseComponentBase
            ) {
                const messages = errors[cell.getId()!];
                const isError = isCellError(cell);
                if (messages && !isError) {
                    this.setCellDisplayError(cell);
                }
                else if (!messages && isError) {
                    this.setCellDisplayNormal(cell);
                }
            }
        }
    }

    public setCellDisplayError(cell: Cell): void {
        this.setCellColor(
            cell,
            theme.palette.error.main,
            theme.palette.error.main
        );
    }

    public setCellDisplayHovered(cell: Cell): void {
        this.setCellColor(
            cell,
            theme.custom.maxgraph.canvas.hoverColor,
            theme.custom.maxgraph.canvas.hoverColor
        );
    }

    public setCellDisplayNormal(cell: Cell): void {
        const val = cell.getValue();
        const fontColor =
            (val instanceof FirebaseComponentBase && val.getData().color)
                ? val.getData().color
                : theme.palette.canvas.contrastText;

        const strokeColor = val instanceof FirebaseComponentBase
            ? (this.presentation.hasVisibleStroke(val) ? fontColor : "none")
            : fontColor;

        this.setCellColor(
            cell,
            strokeColor,
            fontColor,
        );
    }

    public setAllCellsNormal(): void {
        this.getAllCells().forEach(c => this.setCellDisplayNormal(c));
    }

    public setCellColor(
        cell: Cell,
        strokeColor: string,
        fontColor: string
    ): void {
        if (!(cell.getValue() instanceof FirebaseComponentBase<any>)) return;
        this.batchUpdate(() => {
            this.setCellStyle(
                {
                    ...cell.getStyle(),
                    strokeColor,
                    fontColor,
                },
                [cell]
            );
        });
    }

    public createEdgeHandler(state: CellState, edgeStyle: any): EdgeHandler {
        if (
            state.cell.getValue()
            && state.cell.getValue() instanceof FirebasePointerComponent
        ) {
            this.lastEdgeHandler = new MCEdgeHandler(state);
        }
        else {
            this.lastEdgeHandler = super.createEdgeHandler(state, edgeStyle);
        }
        return this.lastEdgeHandler;
    }

    protected refreshLabels(cells: Cell[]): void {
        this.getView()
            .getCellStates(cells)
            .forEach(s => this.getCellRenderer().redrawLabel(s, true));
    }

    protected findComponentUpdates(
        newComponents: FirebaseComponent[],
        oldComponents: FirebaseComponent[]
    ): { newIds: string[], updatedIds: string[], deletedIds: string[] } {
        const newIds: string[] = [];
        const updatedIds: string[] = [];
        const deletedIds: string[] = [];
        // Find new and updated components
        newComponents.forEach(
            component => {
                const cell = this.getCellWithId(component.getId());
                if (!cell) {
                    // Cell doesn't exist yet
                    newIds.push(component.getId());
                }
                else if (
                    !cell.getValue().equals(component)
                ) {
                    // Cell exists but has updates
                    updatedIds.push(component.getId());
                }
            }
        );
        for (const component of oldComponents) {
            if (!newComponents.find(c => c.getId() === component.getId())) {
                deletedIds.push(component.getId());
            }
        }
        return { newIds, updatedIds, deletedIds };
    }

    private isAlreadyReplaced(replacementId: string, replaced: Cell) {
        return replaced.getParent()!.getId() === replacementId;
    }

    private findCellSubstitutedIds(cell: Cell): string[] {
        return cell.getChildCells().filter(child =>
            !FirebaseStaticModel.isChildIdFor(cell.getId()!, child.getId()!)
        ).map(child =>
            child.getId()!
        );
    }

    private cellHasSubstitution(cell: Cell): boolean {
        return this.findCellSubstitutedIds(cell).length > 0;
    }

    public refreshSubstitutions(substitutions: FirebaseSubstitution[]): void {
        const tryRefreshSubstitutions = (n: number = 0) => {
            // Make sure components have been loaded
            if (
                this.getCurrentComponents().length === 0
                || !this.haveStaticModelsLoaded
            ) {
                if (n < MCGraph.MAX_COMPONENT_LOAD_ATTEMPTS) {
                    setTimeout(
                        () => tryRefreshSubstitutions(n + 1),
                        MCGraph.COMPONENT_LOAD_POLL_MS
                    );
                }
                else if (substitutions.length > 0) {
                    throw new Error("Substitutions loaded but empty components");
                }
            }

            const allCells = this.getAllCells();

            // Add any new substitutions
            for (const sub of substitutions) {
                const replacedCell =
                    allCells.find(c => c.getId() === sub.replacedId);
                if (!replacedCell) {
                    console.error(
                        "Cannot find replaced cell with id " + sub.replacedId
                    );
                    return;
                }

                if (!this.isAlreadyReplaced(sub.replacementId, replacedCell)) {
                    const replacementCell =
                        allCells.find(c => c.getId() === sub.replacementId);
                    if (!replacementCell) {
                        console.error(
                            "Cannot find replacement cell with id "
                            + sub.replacementId
                        );
                        return;
                    }
                    replacedCell.setVisible(false);
                    const geo = replacedCell.getGeometry()!.clone();
                    geo.x = 0;
                    geo.y = 0;
                    geo.height = 0;
                    geo.width = 0;
                    replacedCell.setGeometry(geo);
                    this.addCell(replacedCell, replacementCell);
                }
            }

            // Remove any deleted substitutions
            const cellsWithDeletedSubs = allCells.filter(c =>
                this.cellHasSubstitution(c)
                && !substitutions.find(sub => sub.replacementId === c.getId())
            );
            const subsToUnapply = this
                .makeSubstitutionsForAllChildren(cellsWithDeletedSubs);
            subsToUnapply.forEach(s => this.unapplySubstitution(s));
        }

        tryRefreshSubstitutions();
    }

    private makeSubstitutionsForAllChildren(
        c: Cell | Cell[]
    ): FirebaseSubstitution[] {
        if (c instanceof Cell) c = [c];
        return c.flatMap(c =>
            this.findCellSubstitutedIds(c)
                .map(replacedId => {
                    return {
                        replacementId: c.getId()! as string,
                        replacedId
                    };
                })
        );

    }

    public refreshLoadedModels(models: LoadedStaticModel[]): void {
        const tryRefreshLoadedModels = (n: number = 0) => {
            // Make sure components have been loaded
            if (this.getCurrentComponents().length === 0) {
                if (n < MCGraph.MAX_COMPONENT_LOAD_ATTEMPTS) {
                    setTimeout(
                        () => tryRefreshLoadedModels(n + 1),
                        MCGraph.COMPONENT_LOAD_POLL_MS
                    );
                }
                else {
                    throw new Error("Models loaded but empty components");
                }
            }

            const staticModels: FirebaseStaticModel[] =
                this.getCurrentComponents()
                    .filter(c => c.getType() === ComponentType.STATIC_MODEL)
                    .map(m => m as FirebaseStaticModel);

            if (
                models.find(m =>
                    !staticModels.find(sm => sm.getData().modelId === m.modelId)
                ) && n < MCGraph.MAX_COMPONENT_LOAD_ATTEMPTS
            ) {

                setTimeout(
                    () => tryRefreshLoadedModels(n + 1),
                    MCGraph.COMPONENT_LOAD_POLL_MS
                );
                return;
            }

            this.batchUpdate(() =>
                models.forEach(model => {
                    const components = staticModels
                        .filter(c => c.getData().modelId === model.modelId);
                    if (components.length === 0) throw new Error(
                        "Unable to find static model component for model "
                        + model.modelId
                    );
                    components.forEach(c => {
                        const cell = this.getCellWithIdOrThrow(c.getId());
                        this.presentation.updateCell(
                            c,
                            cell,
                            this,
                            model
                        );
                    });
                })
            );
            this.haveStaticModelsLoaded = true;
        }

        if (models.length === 0) return;
        else tryRefreshLoadedModels();
    }

    private unapplySubstitution(sub: FirebaseSubstitution): void {
        const allCells = this.getAllCells();
        const substitutedCell =
            allCells.find(c => c.getId() === sub.replacedId);

        if (!substitutedCell) {
            console.error(
                "Can't delete substitution: can't find substituted "
                + "cell with id " + sub.replacedId
            );
            return;
        }
        const substitutedComponent = substitutedCell.getValue();

        if (
            substitutedCell.getParent()!.getId() !== sub.replacementId
        ) {
            console.error(
                "Can't delete substitution: component was not substituted. "
                + "Found parent with id "
                + substitutedCell.getParent()!.getId()
                + " but expected "
                + sub.replacementId
            );
            return;
        }

        // Make a new version of the substituted component and redirect all
        // arrows to the new version
        this.batchUpdate(() => {
            const newCell = this.presentation
                .addComponent(
                    substitutedComponent,
                    this,
                    this.getDefaultParentForCell(substitutedCell),
                );
            if (newCell instanceof Array) {
                throw new Error(
                    "Un-substituted a component with multiple parts: "
                    + "should be impossible"
                );
            }
            substitutedCell
                .getIncomingEdges()
                .forEach(e =>
                    this.getDataModel().setTerminal(e, newCell, false)
                );
            substitutedCell
                .getOutgoingEdges()
                .forEach(e =>
                    this.getDataModel().setTerminal(e, newCell, true)
                );
            this.removeCells([substitutedCell]);
            newCell.setId(substitutedCell.getId()!);
        });
    }

    private getDefaultParentForCell(cell: Cell): Cell {
        if (FirebaseStaticModel.isStaticModelChildId(cell.getId()!)) {
            const parentId = FirebaseStaticModel.getParentModelId(cell.getId()!);
            const parent = this.getCellWithId(parentId);
            if (!parent) {
                throw new Error(
                    "Unable to find static model for component. "
                    + `Full path: ${cell.getId()}. Static model id: ${parentId}`
                );
            }
            return parent;
        }
        else {
            return this.getDefaultParent();
        }
    }

    private deleteStaticModel(
        model: FirebaseStaticModel,
        allComponents: FirebaseComponent[]
    ): void {
        // Only delete from db if no remaining models are still using the data
        if (!allComponents.find(c =>
            c.getType() === ComponentType.STATIC_MODEL
            && c.getData().modelId === model.getData().modelId
        )) {
            this.firebaseDataModel.removeStaticModel(
                this.modelUuid,
                model.getData().modelId
            );
        }

        // Delete any substitutions involving the removed static model
        const relevantSubs = this.getSubstitutions().filter(sub =>
            model.isChildId(sub.replacedId)
            || model.isChildId(sub.replacementId)
        );
        relevantSubs.forEach(s => this.unapplySubstitution(s));
        this.firebaseDataModel.unidentifyComponents(
            this.modelUuid,
            relevantSubs.map(s => s.replacedId)
        );
    }

    public isInnerComponent(cell: Cell): boolean {
        return cell.getParent() !== this.getDefaultParent();
    }

    public updateCellLabelPosition(
        cell: Cell,
        x: number,
        y: number,
    ): void {
        const state = this.getView().getState(cell);
        if (!state) {
            console.error("Can't find state for cell with id" + cell.getId());
            return;
        }
        const handler = this.createEdgeHandler(state, {});
        handler.moveLabel(state, x, y);
        handler.reset();
        handler.onDestroy();

        // const parent = cell.getParent();
        // if (this.isInnerComponent(cell) && parent) {
        //     debugger;
        //     const pad = theme.custom.maxgraph.staticModel.componentPaddingPx;
        //     const bbox = this.getBoundingBoxFromGeometry(
        //         parent.getChildren(),
        //         true
        //     )
        //     if (bbox) {
        //         this.batchUpdate(() => {
        //             const geo = parent.getGeometry()!.clone();
        //             geo.width = bbox.width + 2 * pad;
        //             geo.height = bbox.height + 2 * pad;
        //             cell.setGeometry(geo);
        //         });
        //     }
        // }
    }
}
