import ComponentUiData from "../ScreenObjects/ComponentUiData";
import BaseCanvas from "../BaseCanvas";


export default class DeleteModeCanvas extends BaseCanvas {
    protected onComponentClicked(c: ComponentUiData): void {
        this.props.deleteComponent(c.getId());
    }
}

