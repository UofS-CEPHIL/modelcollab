import BaseCanvas from "../BaseCanvas";
import ComponentUiData from "../ScreenObjects/ComponentUiData";
import VisibleUiComponent from "../ScreenObjects/VisibleUiComponent";

export default class IdentifyModeCanvas extends BaseCanvas {

    protected onComponentMouseUp(mouseupComponent: VisibleUiComponent, x: number, y: number): void {
        const selectedComponent = this.props.components.getComponent(this.props.selectedComponentIds[0]);
        if (
            selectedComponent
            && this.props.selectedComponentIds.length === 1
            && this.canIdentify(selectedComponent, mouseupComponent)
        ) {
            this.props.identifyComponents(mouseupComponent, selectedComponent);
        }
        else {
            super.onComponentMouseUp(mouseupComponent, x, y);
        }
    }

    private canIdentify(a: ComponentUiData, b: ComponentUiData): boolean {
        if (a.getType() !== b.getType()) return false;
        if (a.getId() === b.getId()) return false;
        if (this.idsAreFromSameModel(a.getId(), b.getId())) return false;
        return true;
    }

    private idsAreFromSameModel(a: string, b: string): boolean {
        const aSplit = a.split('/');
        const bSplit = b.split('/');
        return aSplit.length === bSplit.length
            && aSplit.slice(0, aSplit.length - 1) === bSplit.slice(0, bSplit.length - 1);
    }
}
