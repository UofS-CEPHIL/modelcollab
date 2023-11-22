import { FirebaseComponentModel as schema } from "database/build/export";
import { Button, Grid, TextField } from "@mui/material";
import { ReactElement } from "react";
import FirebaseDataModel from "../../data/FirebaseDataModel";
import ModalBox, { Props as ModalBoxProps } from "./ModalBox";


export interface Props extends ModalBoxProps {
    onClose: () => void;
    firebaseDataModel: FirebaseDataModel;
    getComponents: () => schema.FirebaseDataComponent<any>[];
}

export interface State {
    modelNameBoxContents: string;
    hasTriedToSave: boolean;
}

export default class ExportModelBox extends ModalBox<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            modelNameBoxContents: "",
            hasTriedToSave: false
        }
    }

    protected getBoxContents(): ReactElement {
        return (
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
                        error={this.shouldShowErrorText()}
                        helperText={this.getErrorText()}
                    />
                </Grid>

                <Grid item xs={4}>
                    <Button
                        variant="contained"
                        onClick={() => this.onSaveButtonPress()}
                        data-testid={"SaveButton"}
                    >
                        Save
                    </Button>
                </Grid>
                <Grid item xs={4}>
                    <Button
                        variant="contained"
                        onClick={this.props.onClose}
                        data-testid={"CancelButton"}
                    >
                        Cancel
                    </Button>
                </Grid>
            </Grid>
        );
    }

    private isTextboxError(): boolean {
        return this.state.modelNameBoxContents.length == 0;
    }

    private shouldShowErrorText(): boolean {
        return this.state.hasTriedToSave && this.isTextboxError();
    }

    private getErrorText(): string {
        return this.shouldShowErrorText() ? "Name must not be empty" : "";
    }

    private onSaveButtonPress(): void {
        if (this.isTextboxError()) {
            this.setState({ hasTriedToSave: true });
        }
        else {
            this.props.firebaseDataModel.addModelToLibrary(
                this.state.modelNameBoxContents,
                this.props.getComponents()
            );
            this.props.onClose();
        }
    }
}
