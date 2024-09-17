import { Button, Divider, FormControl, FormControlLabel, FormLabel, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import LogoutIcon from '@mui/icons-material/Logout';
import React, { KeyboardEvent, ReactElement } from 'react';
import FirebaseDataModel, { ModelType, modelTypeFromString } from '../../data/FirebaseDataModel';
import { Link } from 'react-router-dom';
import { theme } from '../../Themes';
import FirebaseModelsList, { ModelMap } from "../../data/FirebaseModelsList";
import ModelMetadata from '../../data/ModelMetadata';
import { Permission } from '../../data/RTDBSchema';
import FirebaseModelsManager from '../../data/FirebaseModelsManager';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    logOut: () => void;
}

export interface State {
    newModelText: string;
    newModelType: ModelType;
    models: FirebaseModelsList;
}

export default class ModelSelectScreen extends React.Component<Props, State> {

    private readonly modelsManager: FirebaseModelsManager;

    public constructor(props: Props) {
        super(props);
        this.state = {
            models: FirebaseModelsList.EMPTY,
            newModelText: "",
            newModelType: ModelType.StockFlow
        };
        this.modelsManager = new FirebaseModelsManager(
            this.props.firebaseDataModel,
            () => this.state.models,
            models => this.setState(
                { models },
                () => this.modelsManager?.notifyDataUpdated()
            )
        );
    }

    public componentDidMount() {
        this.modelsManager.subscribe();
        this.props.firebaseDataModel.ensureUserInfoInDatabase()
            .catch(e => {
                alert("Error logging in");
                console.error(e);
            });
    }

    public componentWillUnmount() {
        this.modelsManager.unsubscribe();
        this.setState({ models: FirebaseModelsList.EMPTY });
    }

    public render(): ReactElement {
        const models =
            this.state.models?.withDuplicatesFiltered()
            ?? FirebaseModelsList.EMPTY;

        return (
            <List>
                <ListItem key={"welcome-listitem"}>
                    <Grid container direction="row">
                        <Grid item xs={10}>
                            <Typography
                                variant="h3"
                                fontWeight={"bold"}
                            >
                                Model Selection
                            </Typography>
                        </Grid>
                        <Grid item xs={2}>
                            <Button
                                variant="contained"
                                onClick={() => this.props.logOut()}
                            >
                                <LogoutIcon sx={{ paddingRight: 2 }} />
                                Sign Out
                            </Button>
                        </Grid>
                    </Grid>
                </ListItem>
                <ListSubheader key={"new-model-header"}>
                    Add New Model
                </ListSubheader>
                {this.makeNewModelFormListItem()}
                <Divider />
                <ListSubheader key={"your-models-header"}>
                    Your Models
                </ListSubheader>
                {
                    this.makeModelsListItems(models.ownedModels, true)
                }
                <Divider />
                <ListSubheader key={"shared-models-header"}>
                    Shared With You
                </ListSubheader>
                {this.makeModelsListItems(models.sharedModels)}
                <Divider />
                <ListSubheader key={"public-models-header"}>
                    Public Models
                </ListSubheader>
                {this.makeModelsListItems(models.publicModels)}
            </List >
        );
    }

    private makeModelsListItems(
        models?: ModelMap,
        isOwnedModel: boolean = false
    ): ReactElement[] {

        if (!models || models.isEmpty()) return [];
        return [...models.values()].map(
            model => (
                <ListItem
                    style={{ color: theme.palette.text.primary }}
                    key={model.modelId}
                >
                    <Grid
                        container
                        direction="row"
                        alignItems="center"
                        spacing={2}
                    >
                        <Grid item xs={11}>
                            <ListItemButton
                                component={Link}
                                to={`${model.modelType}/${model.modelId}`}
                            >
                                <ListItemText
                                    primary={model.modelName}
                                    secondary={
                                        this.getModelTypeDetailsText(
                                            model,
                                            isOwnedModel
                                        )
                                    }
                                />
                            </ListItemButton>
                        </Grid>
                        {
                            isOwnedModel && <Grid item xs={1}>
                                <IconButton
                                    sx={{
                                        ["&:hover"]: {
                                            color: theme.palette.error.main
                                        }
                                    }}
                                    onClick={() =>
                                        this.deleteModel(
                                            model.modelId,
                                            model.modelName ?? "[Not Found]"
                                        )
                                    }
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </IconButton>
                            </Grid>
                        }
                    </Grid>
                </ListItem >
            )
        );
    }

    private makeNewModelFormListItem(): ReactElement {

        const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && !this.isModelNameError()) {
                this.addModel();
            }
        }

        return (
            <ListItem key={-10}>
                <TextField
                    label="Name"
                    sx={{ ml: 1, mr: 3, width: "60%" }}
                    value={this.state.newModelText}
                    error={!this.isModelNameEmpty() && this.isModelNameError()}
                    onKeyUp={handleKeyUp}
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

    private getModelTypeDetailsText(
        model?: ModelMetadata,
        isOwnedModel: boolean = false
    ): string {

        if (!model) return "";

        const infoStrings: string[] = [];

        if (model.modelType) {
            switch (model.modelType) {
                case ModelType.StockFlow:
                    infoStrings.push("Stock & Flow Model");
                    break;
                case ModelType.CausalLoop:
                    infoStrings.push("Causal Loop Diagram");
                    break;
                default:
                    throw new Error("Unknown model type " + model.modelType);
            }
        }

        if (!isOwnedModel && model.userPermission) {
            switch (model.userPermission) {
                case Permission.READ:
                    infoStrings.push("Read-Only");
                    break;
                case Permission.READWRITE:
                    infoStrings.push("Read & Write");
                    break;
                default:
                    throw new Error(
                        "Unknown model permission: " + model.userPermission
                    );
            }
        }

        if (!isOwnedModel && model.ownerName) {
            infoStrings.push(`Owned by ${model.ownerName}`);
        }

        return infoStrings.join("  |  ");
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
        }
    }

    private isModelNameUsed(): boolean {
        if (this.state.models) {
            return [...this.state.models.ownedModels.values()].find(
                m => m.modelName == this.state.newModelText
            ) !== undefined;
        }
        else {
            return false;
        }
    }

    private deleteModel(uuid: string, name: string): void {
        if (window.confirm(`Delete model "${name}"?`)) {
            this.props.firebaseDataModel.deleteModel(uuid);
        }
    }

    private isModelNameError(): boolean {
        return this.isModelNameBlank() || this.isModelNameUsed();
    }

    private isModelNameBlank(): boolean {
        return /^\s*$/.test(this.state.newModelText);
    }

    private isModelNameEmpty(): boolean {
        return this.state.newModelText === "";
    }
}
