import { Cell, CellStyle, Point } from "@maxgraph/core";
import ComponentType from "../../../../data/components/ComponentType";
import FirebaseFlow from "../../../../data/components/FirebaseFlow";
import IdGenerator from "../../../../IdGenerator";
import { theme } from "../../../../Themes";
import FlowPresentation from "../../presentation/FlowPresentation";
import AddArrowBehaviour from "../AddArrowBehaviour";

export default class FlowModeBehaviour extends AddArrowBehaviour {

    public getArrowType(): ComponentType {
        return ComponentType.FLOW;
    }

    public makeLink(src: Cell, tgt: Cell): FirebaseFlow {
        const extractId = (c: Cell) => {
            if (this.isTempCell(c)) {
                if (!c.getGeometry())
                    throw new Error(`Cell ${c.getId()} has no geometry`);
                return FirebaseFlow.makePoint(
                    c.getGeometry()!.x,
                    c.getGeometry()!.y
                );
            }
            else {
                if (!c.getId())
                    throw new Error(`Cell ${c.getValue()} has no geometry`);
                return c.getId()!;
            }
        }

        return FirebaseFlow.createNew(
            IdGenerator.generateUniqueId(this.getFirebaseState()),
            extractId(src),
            extractId(tgt),
        );
    }

    public canvasClicked(): void {
        const keydownCell = this.getKeydownCell();
        if (keydownCell) {
            super.canvasClicked();
        }
        else {
            const previewCloud = this.addTempVertex(
                theme.custom.maxgraph.cloud.defaultWidthPx,
                theme.custom.maxgraph.cloud.defaultHeightPx,
                "",
                FlowPresentation.makeCloudStyle()
            );
            this.cellClicked(previewCloud);
        }
    }

    public getPreviewArrowStyle(): CellStyle {
        return FlowPresentation.makeEdgeStyle();
    }

    // TODO refactor to handle clouds, add 'canConnect' to FirebaseFlow, add
    // preview arrow style

}
