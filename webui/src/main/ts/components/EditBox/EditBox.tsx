import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Grid, TextField } from '@mui/material';
import React, { ReactElement } from 'react';
import { FirebaseComponentModel as schema } from "database/build/export";

export interface Props {
    initialComponent: schema.FirebaseDataComponent<any>;
    handleSave: (c: schema.FirebaseDataComponent<any>) => void;
    handleCancel: () => void;
}

export interface State {
    component: schema.FirebaseDataComponent<any>;
}

export default class EditBox extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = { component: props.initialComponent };
    }

    private static TEXT_INPUT_CLASS: string = "EditBoxTextInput";

    private STYLE = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    private handleChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>): void {
        const newData = { ...this.state.component.getData(), [event.target.name]: event.target.value };
        let component: schema.FirebaseDataComponent<any> = this.state.component.withData(newData);
        this.setState({ component });
    };

    render(): ReactElement {
        let componentTypeString: string;
        let fieldsAndLabels: { [field: string]: string };
        switch (this.props.initialComponent.getType()) {
            case schema.ComponentType.STOCK:
                componentTypeString = "Stock";
                fieldsAndLabels = { text: "Name", initvalue: "Initial Value" };
                break;
            case schema.ComponentType.FLOW:
                componentTypeString = "Flow";
                fieldsAndLabels = { text: "Name", equation: "Equation" };
                break;
            case schema.ComponentType.PARAMETER:
                componentTypeString = "Parameter";
                fieldsAndLabels = { text: "Name", value: "Value" };
                break;
            case schema.ComponentType.SUM_VARIABLE:
                componentTypeString = "Sum Variable";
                fieldsAndLabels = { text: "Name" };
                break;
            case schema.ComponentType.VARIABLE:
                componentTypeString = "Dynamic Variable";
                fieldsAndLabels = { text: "Name", value: "Value" };
                break;
            default:
                throw new Error("Unable to render edit box for  " + this.props.initialComponent.getType());
        }
        return (
            <Modal open={true} data-testid={"EditBox"}>
                <Box sx={this.STYLE}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {
                                this.renderContents(componentTypeString, fieldsAndLabels)
                            }
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    this.props.handleSave(this.state.component)
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

    private renderContents(componentTypeName: string, fieldsAndLabels: { [field: string]: string }): ReactElement {
        return (
            <Box>
                <Typography variant="h6" component="h2" data-testid={"HeaderText"}>
                    Edit {componentTypeName}
                </Typography>
                {
                    Object.keys(fieldsAndLabels).map((fieldName, i) => {
                        const labelText: string = fieldsAndLabels[fieldName] || "Error: cannot find label text";
                        const initialText: string = this.state.component.getData()[fieldName];
                        return (
                            <TextField
                                value={initialText}
                                onChange={e => this.handleChange(e)}
                                name={fieldName}
                                label={labelText}
                                inputProps={{
                                    className: EditBox.TEXT_INPUT_CLASS,
                                    id: this.props.initialComponent.getId(),
                                    "data-testid": `${fieldName}-textfield`
                                }}
                                key={i}
                            />
                        )
                    })
                }
            </Box >
        );
    }
}

