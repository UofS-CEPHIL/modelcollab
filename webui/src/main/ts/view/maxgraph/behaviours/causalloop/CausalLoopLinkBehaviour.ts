import { Cell } from "@maxgraph/core";
import ComponentType from "../../../../data/components/ComponentType";
import FirebaseCausalLoopLink from "../../../../data/components/FirebaseCausalLoopLink";
import FirebasePointerComponent from "../../../../data/components/FirebasePointerComponent";
import IdGenerator from "../../../../IdGenerator";
import AddArrowBehaviour from "../AddArrowBehaviour";

export default class CausalLoopLinkBehaviour
    extends AddArrowBehaviour {

    public getArrowType(): ComponentType {
        return ComponentType.CLD_LINK;
    }

    public makeLink(source: Cell, target: Cell): FirebasePointerComponent<any> {
        return FirebaseCausalLoopLink.createNew(
            IdGenerator.generateUniqueId(
                this.getFirebaseState()
            ),
            source.getId()!,
            target.getId()!
        );
    }
}
