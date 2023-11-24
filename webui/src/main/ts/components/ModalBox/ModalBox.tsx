import { Modal, Box } from '@mui/material';
import React, { ReactElement } from 'react';

import modalStyle from "../style/modalStyle";

export interface Props {
    width?: number;
}

export interface State {

}

export default abstract class ModalBox<BoxProps extends Props, BoxState extends State>
    extends React.Component<BoxProps, BoxState> {

    private static readonly DEFAULT_WIDTH_PX = 700;

    protected abstract getBoxContents(): ReactElement;

    public render(): ReactElement {
        const style = modalStyle;
        style.width = this.props.width ?? ModalBox.DEFAULT_WIDTH_PX;

        return (
            <Modal open={true} data-testid={"EditBox"}>
                <Box sx={style}>
                    {this.getBoxContents()}
                </Box>
            </Modal>
        );
    }
}
