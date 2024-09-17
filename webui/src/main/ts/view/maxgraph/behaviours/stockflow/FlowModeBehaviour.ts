import { Cell, CellStyle, EventObject } from "@maxgraph/core";
import { v4 as uuid } from "uuid";
import ComponentType from "../../../../data/components/ComponentType";
import FirebaseFlow from "../../../../data/components/FirebaseFlow";
import FirebaseStock from "../../../../data/components/FirebaseStock";
import { theme } from "../../../../Themes";
import FlowPresentation from "../../presentation/FlowPresentation";
import AddArrowBehaviour from "../AddArrowBehaviour";

export default class FlowModeBehaviour extends AddArrowBehaviour {

    public getArrowType(): ComponentType {
        return ComponentType.FLOW;
    }

    public isValidArrowSource(c: Cell): boolean {
        return c.getValue() instanceof FirebaseStock || this.isTempCell(c);
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
            uuid(),
            extractId(src),
            extractId(tgt),
        );
    }

    public canvasClicked(x: number, y: number, event: EventObject): void {
        const keydownCell = this.getKeydownCell();
        if (keydownCell && this.isTempCell(keydownCell)) {
            super.canvasClicked(x, y, event);
        }
        else {
            const previewCloud = this.addTempVertex(
                theme.custom.maxgraph.cloud.defaultWidthPx,
                theme.custom.maxgraph.cloud.defaultHeightPx,
                "",
                FlowPresentation.makeCloudStyle()
            );
            this.cellClicked(previewCloud, event);
        }
    }

    public getPreviewArrowStyle(): CellStyle {
        const style = FlowPresentation.getEdgeStyle();
        // Add spacing away from the cursor to avoid accidentally clicking on
        // the preview arrow
        style.perimeterSpacing = 7;
        return style;
    }
}
