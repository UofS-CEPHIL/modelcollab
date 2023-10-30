import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import DefaultBehaviours from "./DefaultBehaviours";

export interface Point { x: number, y: number };

export default class FlowModeBehaviour extends DefaultBehaviours {

    private firstClick: Cell | Point | null = null;

    public canvasClicked(x: number, y: number): void {
        // Only allow flows if at least one item is a cell
        if (this.firstClick instanceof Cell) {
            this.addFlow(this.firstClick, { x, y });
        }
        else {
            this.firstClick = { x, y };
        }
    }

    public canvasRightClicked(_: number, __: number) {
        // On right click, forget the last selected cell/point
        this.firstClick = null;
    }

    public selectionChanged(selection: Cell[]): void {
        if (selection.length == 1 && this.isCellStock(selection[0])) {
            console.log('stock')
            if (this.firstClick) {
                if (!this.isCellAlreadySelected(selection[0])) {
                    this.addFlow(this.firstClick, selection[0]);
                }
            }
            else {
                this.firstClick = selection[0];
            }
        }
        // If the user selects a group, forget the last selected cell/point
        else if (selection.length > 1) {
            this.firstClick = null;
        }
        console.log("firstclick = " + this.firstClick);
    }

    private isCellAlreadySelected(cell: Cell): boolean {
        return this.firstClick instanceof Cell
            && this.firstClick.getId() === cell.getId()
    }

    private isCellStock(cell: Cell): boolean {
        const cellId = cell.getId();
        const components = this.getFirebaseState();
        const match = components.find(c => c.getId() === cellId);
        return match instanceof schema.StockFirebaseComponent;
    }

    private addFlow(fr: Cell | Point, to: Cell | Point) {

        function getStringRepresentation(c: Cell | Point): string {
            // TODO store this logic with Firebase stuff
            return c instanceof Cell ? c.getId()! : `p${c.x},${c.y}`;
        }

        this.firstClick = null;
        var fromId: string = getStringRepresentation(fr);
        var toId: string = getStringRepresentation(to);

        const newFlow = new schema.FlowFirebaseComponent(
            IdGenerator.generateUniqueId(this.getFirebaseState()),
            { from: fromId, to: toId, text: "Flow", equation: "" }
        );
        this.getActions().addComponent(newFlow);
        this.getGraph().setSelectionCell(null);
    }
}
