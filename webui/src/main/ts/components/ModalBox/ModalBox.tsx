import { Modal, Box } from '@mui/material';
import React, { ReactElement } from 'react';
import { theme } from '../../Themes';

export interface Props {
    width?: number;
}

export interface State {

}

export default abstract class ModalBox<BoxProps extends Props, BoxState extends State>
    extends React.Component<BoxProps, BoxState> {

    protected abstract getBoxContents(): ReactElement;

    public render(): ReactElement {
        const style = theme.custom.modal;
        if (this.props.width) style.width = this.props.width;

        return (
            <Modal open={true} data-testid={"EditBox"}>
                <Box sx={style}>
                    {this.getBoxContents()}
                </Box>
            </Modal>
        );
    }
}
