import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Grid, TextField } from '@mui/material';
import React, { ReactElement } from 'react';
import { FirebaseComponentModel as schema } from "database/build/export";

const ERROR_MESSAGE = "Error: unknown component type"
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
        return (
            <Modal open={true}>
                <Box sx={this.STYLE}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {this.renderContents()}
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    this.props.handleSave(this.state.component)
                                }}
                            >
                                Save
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="contained"
                                onClick={this.props.handleCancel}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
        );
    }

    private renderBoxHeaders(componentType: string): string{
        switch (componentType){
            case schema.ComponentType.STOCK:
                return "Edit Stock";
            case schema.ComponentType.FLOW:
                return "Edit Flow";
            case schema.ComponentType.PARAMETER:
                return "Edit Parameter";
            case schema.ComponentType.VARIABLE:
                return "Edit Dynamic Variable";
            case schema.ComponentType.SUM_VARIABLE:
                return "Edit Sum Variable";
            default:
                return ERROR_MESSAGE;
        }
    }

    private renderBoxContents(componentType: string): ReactElement{
        switch (componentType){
            case schema.ComponentType.STOCK:
                return (             
                    <TextField id="outlined-basic"
                    value={this.state.component.getData().initvalue}
                    onChange={e => this.handleChange(e)}
                    name="initvalue"
                    label="Initial Value"
                    inputProps={{
                        className: "Init_Value",
                        id: this.props.initialComponent.getId(),
                        "data-testid": "stock-textfield-mui"
                    }} 
            />
                )
            case schema.ComponentType.FLOW:
                return (
                    <TextField id="outlined-basic"
                        value={this.state.component.getData().equation}
                        onChange={e => this.handleChange(e)}
                        name="equation"
                        label="Equation"
                        inputProps={{
                            className: "Equation",
                            id: this.props.initialComponent.getId(),
                            "data-testid": "stock-textfield-mui"
                        }}
                    />
                )
            case schema.ComponentType.PARAMETER || schema.ComponentType.VARIABLE :
                return (
                    <TextField id="outlined-basic"
                        value={this.state.component.getData().value}
                        onChange={e => this.handleChange(e)}
                        name="value"
                        label="Value"
                        inputProps={{
                            className: "Value",
                            id: this.props.initialComponent.getId(),
                            "data-testid": "stock-textfield-mui"
                        }}
                    />
                )
            default:
                return (
                    <></>
                )          
        }
    }

    private renderContents(): ReactElement {
        return (
            <Box>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {this.renderBoxHeaders(this.state.component.getType())}
                </Typography>

                {this.renderBoxHeaders(this.state.component.getType()) !== ERROR_MESSAGE
                &&    <TextField
                            id="outlined-basic"
                            value={this.state.component.getData().text}
                            onChange={e => this.handleChange(e)}
                            name="text"
                            label="Name"
                            inputProps={{
                                className: "Name",
                                id: this.props.initialComponent.getId(),
                                "data-testid": "stock-textfield-mui"
                            }}
                        />}
                {this.renderBoxContents(this.state.component.getType())} 
                 
            </Box>
        )
    }
}

