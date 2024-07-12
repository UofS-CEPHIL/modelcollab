import { Box, Button, Grid, Typography } from "@mui/material";
import { ReactElement } from "react";
import ModalBox, { Props as ModalBoxProps, State as ModalBoxState } from "./ModalBox";

export type ModalButtonProps = { label: string, callback?: () => void };

export interface Props extends ModalBoxProps {
    children: ReactElement | ReactElement[];
    buttons: ModalButtonProps[];
}

export default abstract class ButtonBox
    <P extends Props, S extends ModalBoxState>
    extends ModalBox<P, S>
{
    protected getBoxContents(): ReactElement {
        return (
            <Box textAlign="center">
                <Grid container direction="column">
                    <Grid item xs={12} key="children">
                        {this.props.children}
                    </Grid>
                    <Grid
                        item
                        container
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                        key="buttoncontainer"
                    >
                        {this.makeButtons()}
                    </Grid>
                </Grid>
            </Box>

        );
    }

    private makeButtons(): ReactElement[] {
        return this.props.buttons.map(b => this.makeButton(b.label, b.callback));
    }

    private makeButton(label: string, callback?: () => void): ReactElement {
        return (
            <Grid item key={label}>
                <Button onClick={callback} variant="contained">
                    <Typography variant="h6" component="div">
                        {label}
                    </Typography>
                </Button>
            </Grid>
        );
    }
}
