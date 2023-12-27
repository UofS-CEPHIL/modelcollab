import { Cell, Point } from "@maxgraph/core";
import ComponentType from "../../../data/components/ComponentType";
import { FirebaseComponentBase } from "../../../data/components/FirebaseComponent";
import FirebaseConnection from "../../../data/components/FirebaseConnection";
import IdGenerator from "../../../IdGenerator";
import ArrowBehaviour from "./ArrowBehaviour";

export class ConnectModeBehaviour extends ArrowBehaviour {

    protected canConnect(source: Cell | Point, target: Cell | Point): boolean {
        // Can't connect anything with a point on the canvas background. This
        // shouldn't be possible at all but is required to avoid compiler
        // errors, and is a useful sanity check
        if (!(source instanceof Cell && target instanceof Cell)) {
            console.error(
                "Trying to attach a non-component with a connection. "
                + `Source ${source}, target ${target}`
            );
            return false;
        }

        // Can't connect to or from a cloud
        if (!(
            source.getValue() instanceof FirebaseComponentBase
            && target.getValue() instanceof FirebaseComponentBase
        )) {
            return false;
        }

        // Can't connect to a parameter
        if (
            this.getGraph().isCellType(target, ComponentType.PARAMETER)
        ) {
            return false;
        }

        // Can't connect from a flow
        if (source.getValue().getType() === ComponentType.FLOW) {
            return false;
        }

        return true;
    }

    protected connectComponents(
        source: Cell | Point,
        target: Cell | Point
    ): void {
        // Can't connect anything with a point on the canvas background. This
        // shouldn't be possible at all but is required to avoid compiler
        // errors, and is a useful sanity check
        if (!(source instanceof Cell && target instanceof Cell)) {
            console.error(
                "Trying to attach a non-component with a connection. "
                + `Source ${source}, target ${target}`
            );
            return;
        }

        var fromId: string = source.getId()!;
        var toId: string = target.getId()!;
        const newConnection = new FirebaseConnection(
            IdGenerator.generateUniqueId(this.getFirebaseState()),
            { from: fromId, to: toId, handleXOffset: 0, handleYOffset: 0 }
        );
        this.getActions().addComponent(newConnection);
    }
}
