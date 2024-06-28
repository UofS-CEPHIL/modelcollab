import { Button, Divider, FormControl, FormControlLabel, FormLabel, Grid, IconButton, List, ListItem, ListItemButton, ListItemText, ListSubheader, Radio, RadioGroup, TextField, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import LogoutIcon from '@mui/icons-material/Logout';
import React, { KeyboardEvent, ReactElement } from 'react';
import FirebaseDataModel, { ModelsList, ModelType, modelTypeFromString } from '../../data/FirebaseDataModel';
import { Link } from 'react-router-dom';
import { theme } from '../../Themes';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    logOut: () => void;
}

export interface State {
    myModels: ModelsList;
    sharedModels: ModelsList;
    newModelText: string;
    newModelType: ModelType;
    unsubscribe?: () => void;
}

export default class ModelSelectScreen extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            myModels: {},
            sharedModels: {},
            newModelText: "",
            newModelType: ModelType.StockFlow
        };
    }

    public componentDidMount() {
        this.props.firebaseDataModel.ensureUserInformationInDatabase()
            .then(() => this.subscribeToModels())
            .catch(e => {
                alert("Error logging in");
                console.error(e);
            });
    }

    public componentWillUnmount() {
        if (this.state.unsubscribe) {
            this.state.unsubscribe();
            this.setState({ unsubscribe: undefined });
        }
    }

    public render(): ReactElement {
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
                {this.makeModelsListItems(this.state.myModels, true)}
                <Divider />
                <ListSubheader key={"shared-models-header"}>
                    Shared With You
                </ListSubheader>
                {this.makeModelsListItems(this.state.sharedModels)}
            </List >
        );
    }

    private makeModelsListItems(
        models: ModelsList,
        canDelete: boolean = false
    ): ReactElement[] {
        return Object.entries(models).map(
            ([uuid, nametype]) => (
                <ListItem
                    style={{ color: theme.palette.text.primary }}
                    key={uuid}
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
                                to={`${nametype.type}/${uuid}`}
                            >
                                <ListItemText
                                    primary={nametype.name}
                                    secondary={this.getModelTypeDisplayText(
                                        nametype.type
                                    )}
                                />
                            </ListItemButton>
                        </Grid>
                        {
                            canDelete && <Grid item xs={1}>
                                <IconButton
                                    sx={{
                                        ["&:hover"]: {
                                            color: theme.palette.error.main
                                        }
                                    }}
                                    onClick={() =>
                                        this.deleteModel(uuid, nametype.name)
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
        return Object.values(this.state.myModels).find(
            m => m.name == this.state.newModelText
        ) !== undefined;
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
        return this.state.newModelText === ""
    }

    private subscribeToModels(): void {
        const unsubMine = this.props.firebaseDataModel.subscribeToOwnedModels(
            m => this.setState({ myModels: m })
        );
        const unsubOthers = this.props.firebaseDataModel.subscribeToSharedModels(
            m => this.setState({ sharedModels: m })

        );
        //        const unsubOthers = () => { }
        this.setState({
            unsubscribe: () => {
                unsubMine();
                unsubOthers();
            }
        });
    }

    private refreshModelList(): void {
        this.props.firebaseDataModel.getOwnedModels().then(
            m => this.setState({
                myModels: m
            })
        ).catch(e =>
            console.error("Error getting models: " + e)
        );
    }

}
