import { Cell, Point } from "@maxgraph/core";
import ComponentType from "../../../data/components/ComponentType";
import FirebaseFlow from "../../../data/components/FirebaseFlow";
import IdGenerator from "../../../IdGenerator";
import ArrowBehaviour from "./ArrowBehaviour";

export default class FlowModeBehaviour extends ArrowBehaviour {

    public canvasClicked(x: number, y: number): void {
        // Only allow flows if at least one item is a cell
        if (this.firstClick instanceof Cell) {
            this.connectComponents(this.firstClick, new Point(x, y));
        }
        else {
            this.firstClick = new Point(x, y);
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
            return c instanceof Cell
                ? c.getId()!
                : FirebaseFlow.makePoint(c.x, c.y);
        }

        var fromId: string = getStringRepresentation(source);
        var toId: string = getStringRepresentation(target);

        this.getActions().addComponent(
            FirebaseFlow.createNew(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                fromId,
                toId
            )
        );
    }

    private isCellStock(cell: Cell): boolean {
        return this.getGraph().isCellType(cell, ComponentType.STOCK);
    }
}
