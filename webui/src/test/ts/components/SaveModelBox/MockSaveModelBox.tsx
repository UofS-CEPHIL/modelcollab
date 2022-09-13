import { ReactElement } from "react";
import SaveModelBox, { Props as SaveModelBoxProps } from "../../../../main/ts/components/SaveModelBox/SaveModelBox";


export default class MockSaveModelBox {

    private readonly props: SaveModelBoxProps;

    public constructor(props: SaveModelBoxProps) {
        this.props = props;
    }

    public render(): ReactElement {
        return (
            <SaveModelBox {...this.props} />
        );
    }
}
