import { ReactElement } from 'react';
import { Grid, Button, List } from '@mui/material';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import ModalBox, { Props as BaseProps, State as BaseState } from '../ModalBox/ModalBox';

export interface Props extends BaseProps {
    handleCancel: () => void;
    handleSubmit: (selected: string) => void;
    firebaseDataModel: FirebaseDataModel;
}

export interface State extends BaseState {

}

export default abstract class ButtonListBox<BoxProps extends Props, BoxState extends State>
    extends ModalBox<BoxProps, BoxState> {

    protected abstract makeListItems(): ReactElement[];

    protected getBoxContents(): ReactElement {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <List>
                        {
                            this.makeListItems()
                        }
                    </List>
                </Grid>
                <Grid item xs={4} />
                <Grid item xs={4}>
                    <Button
                        variant="contained"
                        onClick={this.props.handleCancel}
                        data-testid={"CancelButton"}
                    >
                        Close
                    </Button>
                </Grid>
                <Grid item xs={4} />
            </Grid>

        );
    }
}
