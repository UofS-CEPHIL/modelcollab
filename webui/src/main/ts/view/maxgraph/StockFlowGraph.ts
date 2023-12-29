import { Cell, Graph, InternalMouseEvent, SelectionHandler, TooltipHandler } from "@maxgraph/core";
import PresentationGetter from "./presentation/PresentationGetter";
import { LoadedStaticModel } from "../Screens/StockFlowScreen";
import ModelValidator, { ComponentErrors } from "../../validation/ModelValitador";
import { theme } from "../../Themes";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import { FirebaseSubstitution } from "../../data/components/FirebaseSubstitution";
import ComponentType from "../../data/components/ComponentType";

// This class extends the default MaxGraph `Graph` class with functions to add
// and style specific Stock & Flow diagram components
export default class StockFlowGraph extends Graph {

    private getFirebaseState: () => FirebaseComponent[];
    private loadStaticModelComponents: (name: string) => void;
    private getErrors: () => ComponentErrors;

    public constructor(
        container: HTMLElement,
        getFirebaseState: () => FirebaseComponent[],
        loadStaticModelComponents: (name: string) => void,
        getErrors: () => ComponentErrors
    ) {
        super(container);
        this.getFirebaseState = getFirebaseState;
        this.loadStaticModelComponents = loadStaticModelComponents;
        this.getErrors = getErrors;
        this.setAutoSizeCells(true);

        const selHandler =
            this.getPlugin("SelectionHandler") as SelectionHandler;
        selHandler.getInitialCellForEvent = (me: InternalMouseEvent) => {
            if (me.getState() && me.getState()!.cell) {
                return me.getState()!.cell;
            }
            return null;
        }

        this.setupTooltips();
    }

    private setupTooltips(): void {
        this.setTooltips(true);
        const tooltipHandler = this.getPlugin("TooltipHandler") as TooltipHandler;
        const style = tooltipHandler.div.style;
        style.position = 'absolute';
        style.background = theme.palette.canvas.main;
        style.padding = '8px';
        style.border = '1px solid ' + theme.palette.text.primary;
        style.borderRadius = '5px';
        style.fontFamily = theme.typography.fontFamily || "sans-serif";
        style.fontSize = theme.typography.fontSize.toString();
    }

    public cellLabelChanged = (
        cell: Cell,
        newValue: string,
        resize: boolean = false
    ) => {
        // TODO
        throw new Error("Not implemented");
    }

    public getTooltipForCell = (cell: Cell) => {
        if (!cell.getId()) return "";
        const errs = this.getErrors()[cell.getId()!];
        if (!errs) return "No errors found!";

        return errs.join('\n');
    }

    // Override
    // Returns the string representation of a particular cell
    public convertValueToString(cell: Cell): string {
        const val = cell.getValue();
        if (val instanceof FirebaseComponentBase) {
            return val.getData().text ?? "";
        }
        else {
            return "";
        }
    }


    public refreshComponents(
        newComponents: FirebaseComponent[],
        oldComponents: FirebaseComponent[],
        loadedStaticModels: LoadedStaticModel[]
    ): void {
        const findComponent = (id: string) =>
            newComponents.find(c => c.getId() === id)!;

        const errors = ModelValidator.findErrors(
            newComponents,
            loadedStaticModels
        );

        const updates = this.findComponentUpdates(newComponents, oldComponents);
        const toAdd = updates.newIds.map(findComponent);
        const toUpdate = updates.updatedIds.map(findComponent);

        this.batchUpdate(() => {
            // Add vertices first so that we don't end up in a situation where
            // and edge can't find its source or target
            this.addComponentsInCorrectOrder(toAdd);
            toUpdate.forEach(c => this.updateComponent(c, loadedStaticModels));
            updates.deletedIds.forEach(id => this.deleteComponent(id));
            this.deleteOrphanedClouds(newComponents);
            this.refreshLabels(
                toUpdate.map(c => this.getCellWithId(c.getId())!)
            );
            this.applySubstitutions(newComponents);
            this.showErrors(errors);
        });
    }

    public addComponentsInCorrectOrder(
        toAdd: FirebaseComponent[],
        parent?: Cell,
        movable?: boolean
    ): Cell[] {
        const isEdge = (cpt: FirebaseComponent) =>
            [ComponentType.CONNECTION, ComponentType.FLOW]
                .includes(cpt.getType());

        return [
            ...toAdd
                .filter(c => !isEdge(c))
                .flatMap(vtx => this.addComponent(vtx, parent, movable)),
            ...toAdd
                .filter(isEdge)
                .flatMap(edge => this.addComponent(edge, parent, movable))
        ];
    }

    // Update a component. Call this in the middle of a batch update.
    public updateComponent(
        c: FirebaseComponent,
        loadedStaticModels: LoadedStaticModel[]
    ): void {
        const cell = this.getCellWithId(c.getId())!;
        PresentationGetter
            .getRelevantPresentation(c)
            .updateCell(c, cell, this, loadedStaticModels);
    }

    // Delete a component. Call this in the middle of a batch update.
    public deleteComponent(id: string): void {
        const cell = this.getCellWithId(id);
        if (!cell) {
            // Maybe it was an invisible component
            const components = this.getFirebaseState();
            const component = components.find(c => c.getId() === id);
            if (!component) {
                throw new Error("Unable to find component with ID " + id);
            }
            else if (component.getType() === ComponentType.SUBSTITUTION) {
                this.unapplySubstitution(component);
            }
            // Do nothing for scenarios. If it's anything else, something has
            // gone wrong
            else if (component.getType() !== ComponentType.SCENARIO) {
                console.error(
                    "Trying to delete component but can't find cell with ID "
                    + component.getId()
                );
            }
        }
        else {
            this.removeCells([cell]);
        }
    }

    // Add a new component. Call this in the middle of a batch update.
    public addComponent(
        c: FirebaseComponent,
        parent: Cell = this.getDefaultParent(),
        movable: boolean = true
    ): Cell | Cell[] {
        const result: Cell | Cell[] = PresentationGetter
            .getRelevantPresentation(c)
            .addComponent(
                c,
                this,
                parent,
                (name: string) => this.loadStaticModelComponents(name),
                movable
            );
        return result;
    }

    public getCellWithId(id: string): Cell | undefined {
        return this.getAllCells().find(c => c.getId() === id);
    }

    private isInnerComponentId(id: string): boolean {
        return id.includes('/');
    }

    private refreshLabels(cells: Cell[]): void {
        this.getView()
            .getCellStates(cells)
            .forEach(s => this.getCellRenderer().redrawLabel(s, true));
    }

    private findComponentUpdates(
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

    public isCellType(cell: Cell, cptType: ComponentType): boolean {
        return cell.getValue() instanceof FirebaseComponentBase
            && cell.getValue().getType() === cptType;
    }

    private applySubstitutions(components: FirebaseComponent[]): void {
        const allCells = this.getAllCells();
        const subs = components
            .filter(c => c.getType() === ComponentType.SUBSTITUTION);

        for (const sub of subs) {
            const replacedId = sub.getData().replacedId;
            const replacementId = sub.getData().replacementId;
            const replacedCell =
                allCells.find(c => c.getId() === replacedId);
            if (!replacedCell) {
                console.error(
                    "Cannot find replaced cell with id " + replacedId
                );
                return;
            }

            if (replacedCell.getParent()!.getId() !== replacementId) {
                const replacementCell =
                    allCells.find(c => c.getId() === replacementId);
                if (!replacementCell) {
                    console.error(
                        "Cannot find replacement cell with id " + replacementId
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
    }

    private unapplySubstitution(sub: FirebaseSubstitution): void {
        const allCells = this.getAllCells();
        const substitutedCell =
            allCells.find(c => c.getId() === sub.getData().replacedId);

        if (!substitutedCell) {
            console.error(
                "Can't delete substitution: can't find substituted "
                + "cell with id " + sub.getData().replacedId
            );
            return;
        }
        const substitutedComponent = substitutedCell.getValue();

        if (
            substitutedCell.getParent()!.getId() !== sub.getData().replacementId
        ) {
            console.error(
                "Can't delete substitution: component was not substituted. "
                + "Found parent with id "
                + substitutedCell.getParent()!.getId()
                + " but expected "
                + sub.getData().replacementId
            );
            return;
        }

        // Make a new version of the substituted component and redirect all
        // arrows to the new version
        const newCell = PresentationGetter
            .getRelevantPresentation(substitutedComponent)
            .addComponent(
                substitutedComponent,
                this,
                this.getDefaultParentForCell(substitutedCell),
                undefined,
                true
            );
        if (newCell instanceof Array) {
            throw new Error(
                "Un-substituted a component with multiple parts: "
                + "should be impossible"
            );
        }
        substitutedCell
            .getIncomingEdges()
            .forEach(e => this.getDataModel().setTerminal(e, newCell, false));
        substitutedCell
            .getOutgoingEdges()
            .forEach(e => this.getDataModel().setTerminal(e, newCell, true));
        this.removeCells([substitutedCell]);
        newCell.setId(substitutedCell.getId()!);
    }

    private showErrors(errors: ComponentErrors) {
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
                    this.setCellStyle(
                        {
                            ...cell.getStyle(),
                            strokeColor: theme.palette.error.light,
                            fontColor: theme.palette.error.light,
                        },
                        [cell]
                    );
                    // TODO show tooltips
                }
                else if (!messages && isError) {
                    this.setCellStyle(
                        {
                            ...cell.getStyle(),
                            strokeColor: theme.palette.canvas.contrastText,
                            fontColor: theme.palette.canvas.contrastText,
                        },
                        [cell]
                    );
                }
            }
        }
    }

    private getDefaultParentForCell(cell: Cell): Cell {
        if (this.isInnerComponentId(cell.getId()!)) {
            const split = cell.getId()!.split('/');
            const parentId = split[0];
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

    private isCloudId(id: string): boolean {
        return id.includes('.');
    }

    private getAllCells(parent: Cell = this.getDefaultParent()): Cell[] {
        return parent
            .getChildren()
            .flatMap(c => this.getAllCells(c))
            .concat(parent.getChildren());
    }

    private deleteOrphanedClouds(components: FirebaseComponent[]): void {
        function isCloudOrphan(cloud: Cell): boolean {
            const flowid = cloud.getId()!.split('.')[0];
            return !components.find(c => c.getId() === flowid);
        }

        // Only do this for top-level clouds. Assume that imported models have
        // no orphaned clouds
        const clouds = Object.values(this
            .getDefaultParent()
            .children
        ).filter(c => this.isCloudId(c.getId()!));
        const orphanedClouds = clouds.filter(isCloudOrphan);
        this.removeCells(orphanedClouds);
    }
}
