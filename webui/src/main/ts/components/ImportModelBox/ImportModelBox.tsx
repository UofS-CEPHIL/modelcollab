import { Modal, Box, Grid, Button, List, ListItem, ListItemText, ListItemButton } from '@mui/material';
import React, { ReactElement } from 'react';
import FirebaseDataModel from '../../data/FirebaseDataModel';

import modalStyle from "../style/modalStyle";


export interface Props {
    handleCancel: () => void;
    handleSubmit: (modelName: string) => void;
    database: FirebaseDataModel;
}

interface State {
    savedModelNames: string[];
}

export default class ImportModelBox extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { savedModelNames: [] };
    }

    public componentDidMount(): void {
        this.props.database.subscribeToModelList(
            savedModelNames => this.setState({ savedModelNames })
        );
    }

    public render(): ReactElement {
        return (
            <Modal open={true} data-testid={"EditBox"}>
                <Box sx={modalStyle}>
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
                </Box>
            </Modal>
        );
    }

    private makeListItems(): ReactElement[] {
        return this.state.savedModelNames.map((name, i) => (
            <ListItem disablePadding key={i}>
                <ListItemButton onClick={() => this.props.handleSubmit(name)}>
                    <ListItemText primary={name} />
                </ListItemButton>
            </ListItem>
        ));
    }
}

