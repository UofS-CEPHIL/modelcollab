import { Cell, CellStyle } from "@maxgraph/core";
import ComponentType from "../../../../data/components/ComponentType";
import FirebaseConnection from "../../../../data/components/FirebaseConnection";
import IdGenerator from "../../../../IdGenerator";
import ConnectionPresentation from "../../presentation/ConnectionPresentation";
import AddArrowBehaviour from "../AddArrowBehaviour";

export class ConnectModeBehaviour extends AddArrowBehaviour {

    public getArrowType(): ComponentType {
        return ComponentType.CONNECTION;
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
