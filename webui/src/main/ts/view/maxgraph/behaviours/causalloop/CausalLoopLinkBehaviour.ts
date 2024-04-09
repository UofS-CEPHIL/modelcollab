import { Cell, CellStyle } from "@maxgraph/core";
import ComponentType from "../../../../data/components/ComponentType";
import FirebaseCausalLoopLink from "../../../../data/components/FirebaseCausalLoopLink";
import FirebaseCausalLoopVertex from "../../../../data/components/FirebaseCausalLoopVertex";
import IdGenerator from "../../../../IdGenerator";
import CausalLoopLinkPresentation from "../../presentation/CausalLoopLinkPresentation";
import AddArrowBehaviour from "../AddArrowBehaviour";

export default class CausalLoopLinkBehaviour
    extends AddArrowBehaviour {

    public getArrowType(): ComponentType {
        return ComponentType.CLD_LINK;
    }

    public isValidArrowSource(c: Cell): boolean {
        return c.getValue() instanceof FirebaseCausalLoopVertex;
    }

    public getPreviewArrowStyle(): CellStyle {
        return CausalLoopLinkPresentation.getEdgeStyle();
    }

    public makeLink(source: Cell, target: Cell): FirebaseCausalLoopLink {
        return FirebaseCausalLoopLink.createNew(
            IdGenerator.generateUniqueId(
                this.getFirebaseState()
            ),
            source.getId()!,
            target.getId()!
        );
    }
}
