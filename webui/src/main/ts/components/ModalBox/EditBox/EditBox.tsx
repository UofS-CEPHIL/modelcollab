import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Button, Grid, TextField } from '@mui/material';
import React, { ReactElement } from 'react';
import { FirebaseComponentModel as schema } from "database/build/export";
import ModalBox, { Props as BaseProps, State as BaseState } from '../ModalBox';

export interface Props<Component extends schema.FirebaseDataComponent<any>> extends BaseProps {
    initialComponent: Component;
    handleSave: (c: Component) => void;
    handleCancel: () => void;
}

export interface State<Component extends schema.FirebaseDataComponent<any>> extends BaseState {
    component: Component;
}

export abstract class ExtensibleEditBox
    <
        Component extends schema.FirebaseDataComponent<any>,
        EditBoxProps extends Props<Component>,
        EditBoxState extends State<Component>
    >
    extends ModalBox<EditBoxProps, EditBoxState>
{

    protected abstract getFieldsAndLabels(): { [field: string]: string };

    public abstract getComponentTypeString(): string;

    public abstract getComponentType(): schema.ComponentType;

    private static TEXT_INPUT_CLASS: string = "EditBoxTextInput";

    private handleChange(
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ): void {
        let component: Component = this.updateComponent(
            this.state.component,
            event.target.name,
            event.target.value
        );
        this.setState({ component });
    };

    protected updateComponent(
        old: Component,
        field: string,
        value: string
    ): Component {
        if (!Object.keys(old.getData()).includes(field))
            throw new Error(
                "Received updated field "
                + field
                + " in object with keys "
                + Object.keys(old.getData())
            );
        return old.withData({ ...old.getData(), [field]: value }) as Component;
    }

    protected getValueForField(fieldName: string): string {
        return this.state.component.getData()[fieldName];
    }

    protected getBoxContents(): ReactElement {
        const componentTypeString = this.getComponentTypeString();
        let fieldsAndLabels: { [field: string]: string } = this.getFieldsAndLabels();

        return (
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
        );
    }

    private renderContents(
        componentTypeName: string,
        fieldsAndLabels: { [field: string]: string }
    ): ReactElement {
        return (
            <Box>
                <Typography variant="h6" component="h2" data-testid={"HeaderText"}>
                    Edit {componentTypeName}
                </Typography>
                {
                    Object.keys(fieldsAndLabels).map((fieldName, i) => {
                        const labelText: string = fieldsAndLabels[fieldName] || "Error: cannot find label text";
                        const boxText: string = this.getValueForField(fieldName);
                        return (
                            <TextField
                                value={boxText}
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

export default abstract class EditBox
    <
        Component extends schema.FirebaseDataComponent<any>
    >
    extends ExtensibleEditBox
    <
        Component,
        Props<Component>,
        State<Component>
    >
{
    constructor(props: Props<Component>) {
        super(props);
        this.state = { component: props.initialComponent };
    }
}
