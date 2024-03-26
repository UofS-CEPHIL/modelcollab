import { Cell, CellEditorHandler, CellRenderer, EventObject, Graph, InternalEvent, InternalMouseEvent, Rectangle, SelectionHandler, TooltipHandler } from "@maxgraph/core";
import ComponentType from "../../data/components/ComponentType";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import { theme } from "../../Themes";
import { ComponentErrors } from "../../validation/ModelValitador";
import CausalLoopLinkShape from "./presentation/CausalLoopLinkShape";
import ComponentPresentation from "./presentation/ComponentPresentation";
import LoopIconShape from "./presentation/LoopIconShape";

// Parent class for graphs in ModelCollab
export default abstract class MCGraph extends Graph {

    protected getCurrentComponents: () => FirebaseComponent[];
    protected getErrors: () => ComponentErrors;
    protected presentation: ComponentPresentation<FirebaseComponent>;
    protected firebaseDataModel: FirebaseDataModel;
    protected readonly modelUuid: string;

    public abstract addComponent(
        c: FirebaseComponent,
        parent: Cell,
        movable: boolean
    ): Cell | Cell[];

    public constructor(
        container: HTMLElement,
        firebaseDataModel: FirebaseDataModel,
        modelUuid: string,
        presentation: ComponentPresentation<FirebaseComponent>,
        getCurrentComponents: () => FirebaseComponent[],
        getErrors: () => ComponentErrors
    ) {
        super(container);
        this.presentation = presentation;
        this.getCurrentComponents = getCurrentComponents;
        this.getErrors = getErrors;
        this.firebaseDataModel = firebaseDataModel;
        this.modelUuid = modelUuid;

        this.setAutoSizeCells(true);
        this.setAllowDanglingEdges(false);
        this.setHtmlLabels(true);

        const selHandler =
            this.getPlugin("SelectionHandler") as SelectionHandler;
        selHandler.getInitialCellForEvent = (me: InternalMouseEvent) => {
            if (me.getState() && me.getState()!.cell) {
                return me.getState()!.cell;
            }
            return null;
        }

        this.setupTooltips();

        CellRenderer.registerShape(
            CausalLoopLinkShape.CLD_LINK_NAME,
            //@ts-ignore
            CausalLoopLinkShape
        );
        CellRenderer.registerShape(
            LoopIconShape.LOOP_ICON_NAME,
            //@ts-ignore
            LoopIconShape
        );
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
        if (!errs) return "";

        return errs.join('\n');
    }

    public addComponentsInCorrectOrder(
        toAdd: FirebaseComponent[],
        parent: Cell = this.getDefaultParent(),
        movable: boolean = true
    ): Cell[] {
        const isEdge = (cpt: FirebaseComponent) =>
            [
                ComponentType.CONNECTION,
                ComponentType.FLOW,
                ComponentType.CLD_LINK
            ].includes(cpt.getType());

        return [
            ...toAdd
                .filter(c => !isEdge(c))
                .flatMap(vtx => this.addComponent(vtx, parent, movable)),
            ...toAdd
                .filter(isEdge)
                .flatMap(edge => this.addComponent(edge, parent, movable))
        ];
    }

    public isCellType(cell: Cell, cptType: ComponentType): boolean {
        return cell.getValue() instanceof FirebaseComponentBase
            && cell.getValue().getType() === cptType;
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
        var component = cell.getValue();
        if (component instanceof FirebaseComponentBase) {
            if (component.getData().text == undefined) {
                throw new Error(
                    "Editing text for invalid component type: "
                    + component.getType()
                );
            }
            component = component.withData({
                ...component.getData(),
                text: newValue
            });
            this.firebaseDataModel.updateComponent(this.modelUuid, component);
        }
        // TODO
        // if (resize) {
        //     this.cellSizeUpdated(cell, false);
        // }
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

}
