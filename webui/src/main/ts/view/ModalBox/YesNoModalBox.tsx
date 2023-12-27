import { ReactElement } from "react";
import { Box, Button, Typography } from "@mui/material";
import ModalBox, { Props as ModalBoxProps, State as ModalBoxState } from "./ModalBox";

export interface Props extends ModalBoxProps {
    width?: number;
    prompt: string;
    onYes: () => void;
    onNo: () => void;
}

export default class YesNoModalBox extends ModalBox<Props, ModalBoxState> {

    protected getBoxContents(): ReactElement {
        return (
            <Box textAlign="center">
                <Typography variant="h4" component="div">
                    {this.props.prompt}
                </Typography>
                <Button onClick={this.props.onYes}>
                    <Typography variant="h6" component="div">
                        Yes
                    </Typography>
                </Button>
                <Button onClick={this.props.onNo}>
                    <Typography variant="h6" component="div">
                        No
                    </Typography>
                </Button>
            </Box>
        );
    }
}
