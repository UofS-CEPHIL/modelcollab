import { ReactElement } from "react";
import EditBox, { Props as EditBoxProps } from "../../../../main/ts/components/EditBox/EditBox";

export default class MockEditBox {

    public readonly props: EditBoxProps;

    public constructor(props: EditBoxProps) {
        this.props = props;
    }

    public render(): ReactElement {
        return (
            <EditBox {...this.props} />
        );
    }

}
