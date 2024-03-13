import { Button, Divider, FormControl, FormControlLabel, FormLabel, List, ListItem, ListItemButton, ListItemText, ListSubheader, Radio, RadioGroup, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React, { ReactElement } from 'react';
import FirebaseDataModel, { ModelType, modelTypeFromString } from '../../data/FirebaseDataModel';
import { Link } from 'react-router-dom';
import { theme } from '../../Themes';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
}

export interface State {
    models: { [uuid: string]: { name: string, modelType: string } };
    newModelText: string;
    newModelType: ModelType;
}

export default class ModelSelectScreen extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            models: {},
            newModelText: "",
            newModelType: ModelType.StockFlow
        };
    }

    public componentDidMount() {
        this.refreshModelList();
    }

    public render(): ReactElement {
        return (
            <List>
                <ListSubheader key={-1}>
                    Add New Model
                </ListSubheader>
                {this.makeNewModelFormListItem()}
                <Divider />
                <ListSubheader key={-2}>
                    Your Models
                </ListSubheader>
                {this.makeYourModelsListItems()}
                <Divider />
                <ListSubheader key={-3}>
                    Shared With You
                </ListSubheader>
            </List >
        );
    }

    private makeYourModelsListItems(): ReactElement[] {
        return Object.entries(this.state.models).map(
            (e, i) => (
                <ListItem
                    component={Link}
                    to={`${e[1].modelType}/${e[0]}`}
                    style={{ color: theme.palette.text.primary }}
                    key={i}
                >
                    <ListItemButton>
                        <ListItemText
                            primary={e[1].name}
                            secondary={this.getModelTypeDisplayText(
                                e[1].modelType
                            )}
                        />
                    </ListItemButton>
                </ListItem>
            )
        );
    }

    private makeNewModelFormListItem(): ReactElement {
        return (
            <ListItem key={-10}>
                <TextField
                    label="Name"
                    sx={{ ml: 1, mr: 3, width: "60%" }}
                    value={this.state.newModelText}
                    error={this.isModelNameUsed()}
                    onChange={s =>
                        this.setState({ newModelText: s.target.value })
                    }
                />
                <FormControl sx={{ mr: 3, width: "25%" }}>
                    <FormLabel>
                        Model Type
                    </FormLabel>
                    <RadioGroup
                        row
                        value={this.state.newModelType}
                        onChange={(_, val) => this.setState(
                            { newModelType: modelTypeFromString(val) }
                        )}
                    >
                        <FormControlLabel
                            value={ModelType.StockFlow}
                            control={<Radio />}
                            label="Stock & Flow"
                        />
                        <FormControlLabel
                            value={ModelType.CausalLoop}
                            control={<Radio />}
                            label="Causal Loop"
                        />
                    </RadioGroup>
                </FormControl>
                <Button
                    onClick={() => this.addModel()}
                    variant={"contained"}
                    disabled={this.isModelNameError()}
                    sx={{ width: "15%" }}
                >
                    Create
                </Button>
            </ListItem>
        );
    }

    private getModelTypeDisplayText(dbText: string): string {
        switch (dbText) {
            case ModelType.StockFlow:
                return "Stock & Flow Model";
            case ModelType.CausalLoop:
                return "Causal Loop Diagram";
            default:
                return "Error :Unknown model type " + dbText
        }
    }

    private addModel() {
        if (!this.isModelNameError()) {
            if (this.state.newModelType == ModelType.StockFlow) {
                this.props.firebaseDataModel
                    .addStockFlowModel(this.state.newModelText);
            }
            else if (this.state.newModelType == ModelType.CausalLoop) {
                this.props.firebaseDataModel
                    .addCausalLoopModel(this.state.newModelText);
            }
            else {
                throw new Error(
                    "Unrecognized model type: " + this.state.newModelType
                );
            }

            this.setState({ newModelText: "" });
            this.refreshModelList();
        }
    }

    private isModelNameUsed(): boolean {
        return Object.values(this.state.models).find(
            m => m.name == this.state.newModelText
        ) !== undefined;
    }

    private isModelNameError(): boolean {
        return this.state.newModelText == "" || this.isModelNameUsed();
    }

    private refreshModelList(): void {
        this.props.firebaseDataModel.getOwnedModels().then(
            m => this.setState({
                models: m
            })
        ).catch(e =>
            console.error("Error getting models: " + e)
        );
    }

}
