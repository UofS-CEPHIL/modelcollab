import { FormControl, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import React, { ReactElement } from 'react';
import FirebaseDataModel from '../../../data/FirebaseDataModel';
import IdGenerator from "../../../IdGenerator";
import ModelValidator from "../../../validation/ModelValitador";
import { theme } from "../../../Themes";
import FirebaseScenario from '../../../data/components/FirebaseScenario';
import FirebaseComponent from '../../../data/components/FirebaseComponent';
import FirebaseParameter from '../../../data/components/FirebaseParameter';
import ComponentType from '../../../data/components/ComponentType';

export interface Props {
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
    deleteScenario: (s: FirebaseScenario, callback: () => void) => void;
}

export interface State {
    components: FirebaseComponent[];
    scenarioEditing: FirebaseScenario | null;
    newScenarioName: string;
    newScenarioNameIsError: boolean;
}

type ReactChangeEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>;

export default class EditScenariosSidebarContent extends React.Component<Props, State> {

    private static readonly SCENARIO_SELECT_LABEL_ID = "scenario-select-label";
    private static readonly SCENARIO_SELECT_PICKER_ID = "scenario-selection";

    public constructor(props: Props) {
        super(props);
        this.state = {
            components: [],
            scenarioEditing: null,
            newScenarioName: "",
            newScenarioNameIsError: false
        };
    }

    public componentDidMount() {
        this.refreshComponents();
    }

    public render(): ReactElement {
        return (
            <List>
                {this.makeAddScenarioListItem()}
                {this.makeSelectScenarioListItem()}
                {this.makeRefreshAndSaveListItem()}
                {this.makeParameterListItems()}
                {this.makeDeleteScenarioListItem()}
            </List>
        );
    }

    private makeAddScenarioListItem(): ReactElement {
        return (
            <ListItem key="add-scenario">
                <TextField
                    value={this.state.newScenarioName}
                    onChange={e => this.onNewScenarioTextChanged(e)}
                    name={"Add Scenario"}
                    label={"Add Scenario"}
                    inputProps={{
                        id: "add-scenario-input",
                    }}
                    error={this.state.newScenarioNameIsError}
                    sx={{ flexGrow: 2, marginRight: 0 }}
                />
                <ListItemButton
                    onClick={() => this.addNewScenario()}
                    sx={{ justifyContent: "center" }}
                >
                    <ListItemIcon sx={{ justifyContent: "center" }}>
                        <AddIcon />
                    </ListItemIcon>
                </ListItemButton>
            </ListItem>
        );
    }

    private makeSelectScenarioListItem(): ReactElement {
        const scenarioNames = this.getScenarios().map(s => s.getData().name);
        return (
            <ListItem key="scenario-select">
                <FormControl fullWidth variant="standard">
                    <InputLabel
                        id={EditScenariosSidebarContent
                            .SCENARIO_SELECT_LABEL_ID
                        }
                    >
                        Selected Scenario
                    </InputLabel>
                    <Select
                        labelId={EditScenariosSidebarContent
                            .SCENARIO_SELECT_LABEL_ID
                        }
                        id={EditScenariosSidebarContent
                            .SCENARIO_SELECT_PICKER_ID
                        }
                        value={
                            this.state.scenarioEditing?.getData().name || ""
                        }
                        label="Selected Scenario"
                        onChange={e => this.onScenarioSelectionChanged(e)}
                    >
                        {
                            scenarioNames.map(s =>
                                <MenuItem
                                    value={s}
                                    key={s}
                                >
                                    {s}
                                </MenuItem>
                            )
                        }
                    </Select>
                </FormControl>
            </ListItem>
        );
    }

    private makeRefreshAndSaveListItem(): ReactElement {
        return (
            <ListItem>
                <ListItemButton
                    onClick={() => this.updateScenario()}
                    sx={{ justifyContent: "center" }}
                    disabled={!this.state.scenarioEditing}
                >
                    <ListItemIcon sx={{ justifyContent: "center" }}>
                        <SaveIcon />
                    </ListItemIcon>
                </ListItemButton>
                <ListItemButton
                    onClick={() => this.refreshComponents()}
                    sx={{ justifyContent: "center" }}
                    disabled={!this.state.scenarioEditing}
                >
                    <ListItemIcon sx={{ justifyContent: "center" }}>
                        <RefreshIcon />
                    </ListItemIcon>
                </ListItemButton>
            </ListItem>
        );
    }

    private makeParameterListItems(): ReactElement[] {
        let itemFunc:
            (p: FirebaseComponent, key: number) => ReactElement;

        if (this.state.scenarioEditing) {
            itemFunc = (p, i) =>
                this.makeOneEditableParameterListItem(
                    p as FirebaseParameter,
                    i
                );
        }
        else {
            itemFunc = (p, i) =>
                this.makeOneDefaultParameterListItem(
                    p as FirebaseParameter,
                    i
                );
        }
        return this.state.components
            .filter(c => c.getType() === ComponentType.PARAMETER)
            .map((p, i) => itemFunc(p, i));
    }

    private makeOneDefaultParameterListItem(
        param: FirebaseParameter,
        key: number
    ): ReactElement {
        return this.makeOneParameterListItem(
            param,
            param.getData().value,
            true,
            true,
            key
        );
    }

    private makeOneEditableParameterListItem(
        param: FirebaseParameter,
        key: number
    ): ReactElement {
        if (!this.state.scenarioEditing) throw new Error("No scenario selected");

        const scenario = this.state.scenarioEditing;
        const paramName = param.getData().text;
        const value =
            scenario.getData().paramOverrides[param.getData().text]
            || param.getData().value;
        const isGrayed = value === param.getData().value;
        const handleChange = (e: ReactChangeEvent) => {
            const oldOverrides =
                this.state.scenarioEditing!.getData().paramOverrides;
            const newOverrides = {
                ...oldOverrides,
                [`${paramName}`]: e.target.value
            };
            if (e.target.value == "") delete newOverrides[`${paramName}`];
            const newData = {
                ...this.state.scenarioEditing!.getData(),
                paramOverrides: newOverrides
            };
            this.setState({
                scenarioEditing: this.state.scenarioEditing!.withData(newData)
            });
        }

        return this.makeOneParameterListItem(
            param,
            value,
            isGrayed,
            false,
            key,
            handleChange
        );
    }

    private makeOneParameterListItem(
        param: FirebaseParameter,
        value: string,
        isGrayed: boolean,
        isDisabled: boolean,
        key: number,
        handleChange?: (e: ReactChangeEvent) => void
    ): ReactElement {
        const paramName = param.getData().text;
        const isError = !ModelValidator.isValidNumber(value);
        const color = isGrayed
            ? theme.palette.grayed.main
            : theme.palette.canvas.contrastText;

        return (
            <ListItem key={key}>
                <TextField
                    value={value}
                    onChange={handleChange}
                    name={paramName}
                    label={paramName}
                    error={isError}
                    inputProps={{
                        id: `${paramName}-editbox`,
                    }}
                    sx={{ input: { color: color } }}
                    disabled={isDisabled}
                />
            </ListItem>
        );
    }

    private makeDeleteScenarioListItem(): ReactElement {
        return (
            <ListItem key={"delete-scenario"}>
                <ListItemButton
                    onClick={() => this.deleteScenario()}
                    disabled={this.state.scenarioEditing === null}
                >
                    <ListItemIcon sx={{ color: theme.palette.error.main }}>
                        <DeleteIcon />
                    </ListItemIcon>
                    <ListItemText sx={{ color: theme.palette.error.main }} >
                        <Typography variant="h6" component="div">
                            Delete Scenario
                        </Typography>
                    </ListItemText>
                </ListItemButton>
            </ListItem >
        );
    }

    private getScenarios(): FirebaseScenario[] {
        return this.state.components
            .filter(c => c.getType() === ComponentType.SCENARIO);
    }

    private refreshComponents(): void {
        this.props.firebaseDataModel.getDataForSession(
            this.props.sessionId,
            cpts => {
                const updatedScenario = this.state.scenarioEditing
                    ? cpts.find((cpt: any) =>
                        cpt.getType() === ComponentType.SCENARIO
                        && cpt.getId() === this.state.scenarioEditing!.getId()
                    ) : undefined;
                if (this.state.scenarioEditing !== null && updatedScenario) {
                    this.setState({
                        components: cpts,
                        scenarioEditing: updatedScenario
                    });
                }
                else {
                    this.setState({
                        components: cpts,
                        scenarioEditing: null
                    });
                }
            }
        );
    }

    private onScenarioSelectionChanged(event: SelectChangeEvent): void {
        const scenario = this.getScenarios()
            .find(s => s.getData().name === event.target.value);
        if (!scenario)
            throw new Error("Selected unknown scenario " + event.target.value);
        this.setState({ scenarioEditing: scenario });
        setTimeout(() => this.refreshComponents());
    }

    private onNewScenarioTextChanged(e: ReactChangeEvent): void {
        this.setState({ newScenarioName: e.target.value });
    }

    private addNewScenario(): void {
        if (this.isValidScenarioName(this.state.newScenarioName)) {
            const newComponent = new FirebaseScenario(
                IdGenerator.generateUniqueId(this.state.components),
                { name: this.state.newScenarioName, paramOverrides: {} }
            );
            this.props.firebaseDataModel.updateComponent(
                this.props.sessionId,
                newComponent
            );
            this.setState({
                newScenarioName: "",
                newScenarioNameIsError: false,
                components: this.state.components.concat([newComponent])
            });
        }
        else {
            this.setState({ newScenarioNameIsError: true });
        }
    }

    private updateScenario(): void {
        if (this.state.scenarioEditing) {
            this.props.firebaseDataModel.updateComponent(
                this.props.sessionId,
                this.state.scenarioEditing
            );
        }
    }

    private deleteScenario(): void {
        if (this.state.scenarioEditing) {
            this.props.deleteScenario(
                this.state.scenarioEditing,
                () => this.refreshComponents()
            );
        }
    }

    private isValidScenarioName(name: string): boolean {
        return name.length > 0 &&
            !this.getScenarios()
                .find(c => c.getData().name === this.state.newScenarioName);
    }
}
