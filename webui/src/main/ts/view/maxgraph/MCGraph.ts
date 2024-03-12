import { Cell, Graph, InternalMouseEvent, SelectionHandler, TooltipHandler } from "@maxgraph/core";
import ComponentType from "../../data/components/ComponentType";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import { theme } from "../../Themes";
import { ComponentErrors } from "../../validation/ModelValitador";

// Parent class for graphs in ModelCollab
export default abstract class MCGraph extends Graph {

    protected getFirebaseState: () => FirebaseComponent[];
    protected getErrors: () => ComponentErrors;

    public abstract addComponent(
        c: FirebaseComponent,
        parent: Cell,
        movable: boolean
    ): Cell | Cell[];

    public constructor(
        container: HTMLElement,
        getFirebaseState: () => FirebaseComponent[],
        getErrors: () => ComponentErrors
    ) {
        super(container);
        this.getFirebaseState = getFirebaseState;
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

    public getTooltipForCell = (cell: Cell) => {
        if (!cell.getId()) return "";
        const errs = this.getErrors()[cell.getId()!];
        if (!errs) return "No errors found!";

        return errs.join('\n');
    }

    public addComponentsInCorrectOrder(
        toAdd: FirebaseComponent[],
        parent: Cell = this.getDefaultParent(),
        movable: boolean = true
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

    // Delete a component. Call this in the middle of a batch update.
    public deleteComponent(id: string): void {
        const cell = this.getCellWithId(id);
        if (cell) {
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
        // TODO
        throw new Error("Not implemented");
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

    public getCellWithId(id: string): Cell | undefined {
        return this.getAllCells().find(c => c.getId() === id);
    }

    public getAllCells(parent: Cell = this.getDefaultParent()): Cell[] {
        return parent
            .getChildren()
            .flatMap(c => this.getAllCells(c))
            .concat(parent.getChildren());
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

}