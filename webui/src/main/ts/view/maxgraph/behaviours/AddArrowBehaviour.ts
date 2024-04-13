import { Cell, CellStyle } from "@maxgraph/core";
import ComponentType from "../../../data/components/ComponentType";
import FirebaseCausalLoopLink from "../../../data/components/FirebaseCausalLoopLink";
import FirebaseComponent, { FirebaseComponentBase } from "../../../data/components/FirebaseComponent";
import FirebaseConnection from "../../../data/components/FirebaseConnection";
import FirebaseFlow from "../../../data/components/FirebaseFlow";
import FirebasePointerComponent from "../../../data/components/FirebasePointerComponent";
import ShowPreviewArrowBehaviour from "./ShowPreviewArrowBehaviour";

export default abstract class AddArrowBehaviour
    extends ShowPreviewArrowBehaviour {

    public abstract makeLink(
        src: Cell,
        tgt: Cell
    ): FirebasePointerComponent<any>;

    public abstract getArrowType(): ComponentType;

    // Override to get a preview arrow
    public getPreviewArrowStyle(): CellStyle | null {
        return null;
    }

    // Override to restrict which components will get a preview arrow on click
    public isValidArrowSource(c: Cell): boolean {
        return true;
    }

    public canvasClicked(): void {
        this.resetMode();
    }

    public canvasRightClicked(): void {
        this.resetMode();
    }

    public cellClicked(cell: Cell) {
        const keydownCell = this.getKeydownCell();
        if (keydownCell) {
            if (this.canConnect(
                keydownCell,
                cell
            )) {
                this.getActions().addComponent(
                    this.makeLink(keydownCell, cell)
                );
            }
            this.resetMode();
        }
        else if (this.isValidArrowSource(cell)) {
            this.setKeydownCell(cell);
            const previewStyle = this.getPreviewArrowStyle();
            if (previewStyle) this.addPreviewArrow(cell, previewStyle);
        }
        this.resetMode();
    }

    protected canConnect(
        source: Cell | null,
        target: Cell | null,
    ): boolean {
        if (source && !(source.getValue() instanceof FirebaseComponentBase))
            source = null;
        if (target && !(target.getValue() instanceof FirebaseComponentBase))
            target = null;
        return this.canConnectComponents(
            source ? source.getValue() : null,
            target ? target.getValue() : null,
            this.getArrowType()
        );
    }

    private canConnectComponents(
        source: FirebaseComponent | null,
        target: FirebaseComponent | null,
        arrowType: ComponentType
    ): boolean {
        switch (arrowType) {
            case ComponentType.CLD_LINK:
                return FirebaseCausalLoopLink.canConnect(
                    source,
                    target,
                    this.getFirebaseState()
                );

            case ComponentType.CONNECTION:
                return FirebaseConnection.canConnect(
                    source,
                    target,
                    this.getFirebaseState(),
                );

            case ComponentType.FLOW:
                return FirebaseFlow.canConnect(
                    source,
                    target,
                    this.getFirebaseState(),
                );

            default:
                return false;
        }
    }
}
