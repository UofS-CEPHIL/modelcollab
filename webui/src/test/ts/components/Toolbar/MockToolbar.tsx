import { ReactElement } from "react";
import CanvasScreenToolbar, { Props as ToolbarProps } from "../../../../main/ts/components/Toolbar/CanvasScreenToolbar";
import { UiMode } from "../../../../main/ts/UiMode";


export default class MockToolbar {

    private readonly props: ToolbarProps;

    public constructor(props: ToolbarProps) {
        this.props = props;
    }

    public render(): ReactElement {
        return (
            <CanvasScreenToolbar {...this.props} />
        );
    }

    public setMode(mode: UiMode): void {
        this.props.setMode(mode);
    }

    public returnToSessionSelect(): void {
        this.props.returnToSessionSelect();
    }

}
