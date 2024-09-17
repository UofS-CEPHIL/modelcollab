import { Cell, CellStyle } from "@maxgraph/core";
import { v4 as uuid } from "uuid";
import ComponentType from "../../../../data/components/ComponentType";
import { FirebaseComponentBase } from "../../../../data/components/FirebaseComponent";
import FirebaseConnection from "../../../../data/components/FirebaseConnection";
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
            uuid(),
            src.getId()!,
            tgt.getId()!,
        );
    }

    public getPreviewArrowStyle(): CellStyle {
        return ConnectionPresentation.getEdgeStyle();
    }
}
