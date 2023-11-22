import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import { Point } from "../../DrawingUtils";
import ArrowBehaviour from "./ArrowBehaviour";

export class ConnectModeBehaviour extends ArrowBehaviour {

    protected canConnect(source: Cell | Point, target: Cell | Point): boolean {

        // Can't connect anything to a point on the canvas background.
        // This shouldn't be possible but is left here as a sanity check
        if (!(source instanceof Cell && target instanceof Cell)) {
            console.error(
                "Trying to connect using a canvas point instead of a cell. "
                + `Source ${source}, target ${target}`
            );
            return false;
        }

        // Can't connect to or from a cloud
        if (!(
            source.getValue() instanceof schema.FirebaseDataComponent<any>
            && target.getValue() instanceof schema.FirebaseDataComponent<any>)
        ) {
            return false;
        }

        // Can't connect to a parameter
        if (
            this.getGraph().isCellType(target, schema.ComponentType.PARAMETER)
        ) {
            return false;
        }

        // Can't connect from a flow
        if (source.getValue().getType() === schema.ComponentType.FLOW) {
            return false;
        }

        return true;
    }

    protected connectComponents(
        source: Cell | Point,
        target: Cell | Point
    ): void {
        if (!(source instanceof Cell && target instanceof Cell)) {
            throw new Error(
                "Trying to attach a non-component with a connection. "
                + `Source ${source}, target ${target}`
            );
        }

        var fromId: string = source.getId()!;
        var toId: string = target.getId()!;
        const newConnection = new schema.ConnectionFirebaseComponent(
            IdGenerator.generateUniqueId(this.getFirebaseState()),
            { from: fromId, to: toId, handleXOffset: 0, handleYOffset: 0 }
        );
        this.getActions().addComponent(newConnection);
    }
}
