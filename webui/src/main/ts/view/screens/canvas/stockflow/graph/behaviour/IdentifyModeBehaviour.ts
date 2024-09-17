import { Cell, CellStyle } from "@maxgraph/core";
import ComponentType from "../../../../../../data/components/ComponentType";
import { FirebaseComponentBase } from "../../../../../../data/components/FirebaseComponent";
import FirebaseStaticModel from "../../../../../../data/components/FirebaseStaticModel";
import { theme } from "../../../../../../Themes";
import ShowPreviewArrowBehaviour from "../../../behaviour/ShowPreviewArrowBehaviour";
import ConnectionPresentation from "../presentation/ConnectionPresentation";
import FlowPresentation from "../presentation/FlowPresentation";

// This mode acts as an "arrow mode" in the sense that it creates a pairing
// between two objects by clicking on one then the other. In this case, however,
// no arrow is created on the canvas
export default class IdentifyModeBehaviour extends ShowPreviewArrowBehaviour {

    public static readonly NON_IDENTIFIABLE_TYPES = [
        ComponentType.FLOW,
        ComponentType.CONNECTION,
        ComponentType.STATIC_MODEL,
        ComponentType.SUBSTITUTION
    ];

    protected isValidArrowSource(cell: Cell): boolean {
        return cell.getValue() instanceof FirebaseComponentBase
            && cell.getValue().getType() !== ComponentType.CONNECTION;
    }

    protected getPreviewArrowStyle(): CellStyle {
        const style = ConnectionPresentation.getEdgeStyle();
        style.dashed = true;
        style.strokeColor = theme.palette.secondary.main;
        return style;
    }

    protected cellsConnected(src: Cell, tgt: Cell): void {
        if (this.canConnect(src, tgt)) this.connectComponents(src, tgt);
    }

    protected canConnect(source: Cell, target: Cell): boolean {
        // Can only identify components of the same type
        const componentsBothClouds =
            source.getValue() === FlowPresentation.CLOUD_VALUE
            && target.getValue() === FlowPresentation.CLOUD_VALUE;
        const componentsSameType =
            source.getValue() instanceof FirebaseComponentBase
            && target.getValue() instanceof FirebaseComponentBase
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
        const getParentId = (id: string) =>
            FirebaseStaticModel.isStaticModelChildId(id)
                ? FirebaseStaticModel.getParentModelId(id)
                : "";
        const sourceModel = getParentId(source.getId()!);
        const targetModel = getParentId(target.getId()!);
        if (sourceModel == targetModel) {
            return false;
        }

        return true;
    }

    protected connectComponents(source: Cell, target: Cell): void {
        this.getActions().identifyComponents(
            source.getValue(),
            target.getValue()
        );
    }
}
