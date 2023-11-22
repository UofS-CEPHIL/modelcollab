import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import { Point } from "../../DrawingUtils";
import ArrowBehaviour from "./ArrowBehaviour";

export default class FlowModeBehaviour extends ArrowBehaviour {

    public canvasClicked(x: number, y: number): void {
        // Only allow flows if at least one item is a cell
        if (this.firstClick instanceof Cell) {
            this.connectComponents(this.firstClick, { x, y });
        }
        else {
            this.firstClick = { x, y };
        }
    }

    protected canConnect(source: Cell | Point, target: Cell | Point): boolean {
        // Can't connect two clouds together
        if (!(source instanceof Cell || target instanceof Cell)) {
            return false;
        }

        // Can't connect anything other than a stock
        if (source instanceof Cell && !this.isCellStock(source)) {
            return false;
        }
        if (target instanceof Cell && !this.isCellStock(target)) {
            return false;
        }

        return true;
    }

    protected connectComponents(
        source: Cell | Point,
        target: Cell | Point
    ): void {
        const getStringRepresentation = (c: Cell | Point) => {
            return c instanceof Cell ? c.getId()! : this.makePoint(c.x, c.y);
        }

        var fromId: string = getStringRepresentation(source);
        var toId: string = getStringRepresentation(target);

        const newFlow = new schema.FlowFirebaseComponent(
            IdGenerator.generateUniqueId(this.getFirebaseState()),
            { from: fromId, to: toId, text: "Flow", equation: "" }
        );
        this.getActions().addComponent(newFlow);
    }

    private isCellStock(cell: Cell): boolean {
        return this.getGraph().isCellType(cell, schema.ComponentType.STOCK);
    }

    // TODO store this with firebase stuff
    private makePoint(x: number, y: number): string {
        return `p${x},${y}`;
    }
}
