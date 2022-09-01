import { ReactElement } from "react";
import Toolbar, { Props as ToolbarProps } from "../../../../main/ts/components/Toolbar/Toolbar";
import { UiMode } from "../../../../main/ts/UiMode";


export default class MockToolbar {

    private readonly props: ToolbarProps;

    public constructor(props: ToolbarProps) {
        this.props = props;
    }

    public render(): ReactElement {
        return (
            <Toolbar {...this.props} />
        );
    }

    public setMode(mode: UiMode): void {
        this.props.setMode(mode);
    }

    public returnToSessionSelect(): void {
        this.props.returnToSessionSelect();
    }

}
