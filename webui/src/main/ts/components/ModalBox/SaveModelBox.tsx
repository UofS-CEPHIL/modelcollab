import { Button, Grid, Modal, TextField, Box } from "@mui/material";
import React, { ReactElement } from "react";
import { theme } from "../../Themes";

export interface Props {
    handleSave: (modelId: string) => void;
    handleCancel: () => void;
}

export interface State {
    modelNameBoxContents: string;
}

export default class SaveModelBox extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            modelNameBoxContents: ""
        }
    }

    public render(): ReactElement {
        const style = theme.custom.modal;
        return (
            <Modal open={true} data-testid={"EditBox"}>
                <Box sx={{ ...style, bgcolor: 'background.paper' }}>
                    <Grid container>
                        <Grid item xs={12}>
                            <TextField
                                value={this.state.modelNameBoxContents}
                                onChange={e =>
                                    this.setState({
                                        modelNameBoxContents: e.target.value
                                    })
                                }
                                name={"modelName"}
                                label={"Model Name"}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    this.state.modelNameBoxContents.length > 0 &&
                                        this.props.handleSave(this.state.modelNameBoxContents)
                                }}
                                data-testid={"SaveButton"}
                            >
                                Save
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                onClick={this.props.handleCancel}
                                data-testid={"CancelButton"}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        );
    }
}
