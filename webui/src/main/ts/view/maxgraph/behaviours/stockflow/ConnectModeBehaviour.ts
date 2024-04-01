import { Cell, Point } from "@maxgraph/core";
import ComponentType from "../../../../data/components/ComponentType";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import FirebaseConnection from "../../../../data/components/FirebaseConnection";
import IdGenerator from "../../../../IdGenerator";
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

        // Can't connect to a parameter or connection
        if (
            this.getGraph().isCellType(target, ComponentType.PARAMETER)
            || this.getGraph().isCellType(target, ComponentType.CONNECTION)
        ) {
            return false;
        }

        // Can't connect from a flow or connection
        if (
            this.getGraph().isCellType(source, ComponentType.FLOW)
            || this.getGraph().isCellType(source, ComponentType.CONNECTION)
        ) {
            return false;
        }

        // Can't create duplicate connections
        if (this.getFirebaseState().find(c =>
            c.getType() === ComponentType.CONNECTION
            && c.getData().from === source.getId()
            && c.getData().to === target.getId())
        ) {
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
        this.getActions().addComponent(
            FirebaseConnection.createNew(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                fromId,
                toId
            )
        );
    }
}
