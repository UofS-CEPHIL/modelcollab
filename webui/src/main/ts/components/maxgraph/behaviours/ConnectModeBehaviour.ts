import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import { Point } from "../../DrawingUtils";
import ArrowBehaviour from "./ArrowBehaviour";

export class ConnectModeBehaviour extends ArrowBehaviour {

    protected canConnect(source: Cell | Point, target: Cell | Point): boolean {
        // No clouds allowed TODO
        // TODO prevent from connecting with static models
        if (!(source instanceof Cell && target instanceof Cell)) {
            throw new Error(
                "Trying to attach a non-component with a connection. "
                + `Source ${source}, target ${target}`
            );
        }

        // Parameters have to be standalone
        if (
            this.getGraph().isCellType(target, schema.ComponentType.PARAMETER)
        ) {
            return false;
        }

        // Flows can't connect to anything
        if (this.getGraph().isCellType(source, schema.ComponentType.FLOW)) {
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
