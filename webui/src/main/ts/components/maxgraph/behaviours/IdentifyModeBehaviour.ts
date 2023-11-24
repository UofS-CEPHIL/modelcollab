import { Cell } from "@maxgraph/core";
import { FirebaseComponentModel as schema } from "database/build/export";
import IdGenerator from "../../../IdGenerator";
import { Point } from "../../DrawingUtils";
import FlowPresentation from "../presentation/FlowPresentation";
import ArrowBehaviour from "./ArrowBehaviour";

// This mode acts as an "arrow mode" in the sense that it creates a pairing
// between two objects by clicking on one then the other. In this case, however,
// no arrow is created on the canvas
export default class IdentifyModeBehaviour extends ArrowBehaviour {

    public static readonly NON_IDENTIFIABLE_TYPES = [
        schema.ComponentType.FLOW,
        schema.ComponentType.CONNECTION,
        schema.ComponentType.STATIC_MODEL,
        schema.ComponentType.SCENARIO,
        schema.ComponentType.SUBSTITUTION
    ];

    protected canConnect(source: Cell | Point, target: Cell | Point): boolean {
        // Can't identify anything with a point on the canvas background. This
        // shouldn't be possible at all but is required to avoid compiler
        // errors, and is a useful sanity check
        if (!(source instanceof Cell && target instanceof Cell)) {
            console.error(
                "Trying to attach a non-component with a connection. "
                + `Source ${source}, target ${target}`
            );
            return false;
        }

        // Can only identify components of the same type
        const componentsBothClouds =
            source.getValue() === FlowPresentation.CLOUD_VALUE
            && target.getValue() === FlowPresentation.CLOUD_VALUE;
        const componentsSameType =
            source.getValue() instanceof schema.FirebaseDataComponent<any>
            && target.getValue() instanceof schema.FirebaseDataComponent<any>
            && source.getValue().getType() === target.getValue().getType();
        if (!(componentsBothClouds || componentsSameType)) {
            return false;
        }

        // Can only identify certain types of components
        if (componentsSameType
            && IdentifyModeBehaviour
                .NON_IDENTIFIABLE_TYPES
                .includes(source.getValue().getType())
        ) {
            return false;
        }

        // Can only identify components in different models
        const getParentId = (id: string) => id.includes('/')
            ? id.split('/')[0]
            : "";
        const sourceModel = getParentId(source.getId()!);
        const targetModel = getParentId(target.getId()!);
        if (sourceModel == targetModel) {
            return false;
        }

        return true;
    }

    protected connectComponents(
        source: Cell | Point,
        target: Cell | Point
    ): void {
        // Can't identify anything with a point on the canvas background. This
        // shouldn't be possible at all but is required to avoid compiler
        // errors, and is a useful sanity check
        if (!(source instanceof Cell && target instanceof Cell)) {
            console.error(
                "Trying to attach a non-component with a connection. "
                + `Source ${source}, target ${target}`
            );
            return;
        }

        this.getActions().addComponent(
            new schema.SubstitutionFirebaseComponent(
                IdGenerator.generateUniqueId(this.getFirebaseState()),
                {
                    replacedId: source.getValue().getId(),
                    replacementId: target.getValue().getId()
                }
            )
        );
    }
}