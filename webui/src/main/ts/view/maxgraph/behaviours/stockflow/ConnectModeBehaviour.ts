import { Cell, CellStyle } from "@maxgraph/core";
import ComponentType from "../../../../data/components/ComponentType";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import FirebaseConnection from "../../../../data/components/FirebaseConnection";
import IdGenerator from "../../../../IdGenerator";
import ConnectionPresentation from "../../presentation/ConnectionPresentation";
import AddArrowBehaviour from "../AddArrowBehaviour";

export class ConnectModeBehaviour extends AddArrowBehaviour {

    public getArrowType(): ComponentType {
        return ComponentType.CONNECTION;
    }

    public isValidArrowSource(c: Cell): boolean {
        return c.getValue() instanceof FirebaseComponentBase
            && c.getValue().getType() !== ComponentType.CONNECTION;
    }

    public makeLink(src: Cell, tgt: Cell): FirebaseConnection {
        return FirebaseConnection.createNew(
            IdGenerator.generateUniqueId(this.getFirebaseState()),
            src.getId()!,
            tgt.getId()!,
        );
    }

    public getPreviewArrowStyle(): CellStyle {
        return ConnectionPresentation.getEdgeStyle();
    }
}
