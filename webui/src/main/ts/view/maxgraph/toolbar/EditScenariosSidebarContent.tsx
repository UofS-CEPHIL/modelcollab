import { FormControl, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import React, { KeyboardEvent, ReactElement } from 'react';
import FirebaseDataModel from '../../../data/FirebaseDataModel';
import ModelValidator from "../../../validation/ModelValitador";
import { theme } from "../../../Themes";
import FirebaseScenario from '../../../data/components/FirebaseScenario';
import FirebaseComponent from '../../../data/components/FirebaseComponent';
import FirebaseParameter from '../../../data/components/FirebaseParameter';
import ComponentType from '../../../data/components/ComponentType';
import { LoadedStaticModel } from '../../Screens/StockFlowScreen';
import FirebaseSubstitution from '../../../data/components/FirebaseSubstitution';
import FirebaseStockFlowModel from '../../../data/FirebaseStockFlowModel';
import FirebaseStaticModel from '../../../data/components/FirebaseStaticModel';
import { namedQuery } from 'firebase/firestore';

export interface Props {
    modelUuid: string;
    firebaseDataModel: FirebaseDataModel;
    components: FirebaseComponent[];
    substitutions: FirebaseSubstitution[];
    inners: LoadedStaticModel[];
    scenarios: FirebaseScenario[];
    deleteScenario: (s: FirebaseScenario, callback: () => void) => void;
}

export interface State {
    scenarioEditing: FirebaseScenario | null;
    originalScenario: FirebaseScenario | null;
    newScenarioName: string;
}

type ReactChangeEvent = React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>;

export default class EditScenariosSidebarContent extends React.Component<Props, State> {

    private static readonly SCENARIO_SELECT_LABEL_ID = "scenario-select-label";
    private static readonly SCENARIO_SELECT_PICKER_ID = "scenario-selection";

    public constructor(props: Props) {
        super(props);
        this.state = {
            scenarioEditing: null,
            originalScenario: null,
            newScenarioName: "",
        };
    }

    public componentDidUpdate() {
        if (this.state.scenarioEditing) {
            const newScenario = this.props.scenarios.find(s =>
                s.getId() === this.state.scenarioEditing!.getId()
            );
            if (
                newScenario
                && !newScenario.equals(this.state.originalScenario!)
            ) {
                this.setState({
                    scenarioEditing: newScenario,
                    originalScenario: newScenario
                });
            }
            else if (!newScenario) {
                this.setState({
                    scenarioEditing: null,
                    originalScenario: null
                });
            }
        }
    }

    public componentDidMount() {
        this.refresh();
    }

    public render(): ReactElement {
        return (
            <List>
                {this.makeAddScenarioListItem()}
                {this.makeSelectScenarioListItem()}
                {this.makeStartStopTimeListItems()}
                {this.makeParameterListItems()}
                {this.makeDeleteScenarioListItem()}
            </List>
        );
    }

    private makeAddScenarioListItem(): ReactElement {

        const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                this.addNewScenario();
                document.body.focus();
            }
        }

        return (
            <ListItem key="add-scenario">
                <TextField
                    value={this.state.newScenarioName}
                    onChange={e => this.onNewScenarioTextChanged(e)}
                    onKeyUp={handleKeyUp}
                    name={"Add Scenario"}
                    label={"Add Scenario"}
                    inputProps={{
                        id: "add-scenario-input",
                    }}
                    error={
                        this.state.newScenarioName.length > 0
                        && !this.isValidScenarioName(
                            this.state.newScenarioName
                        )
                    }
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
        const scenarioNames = this.props.scenarios.map(s => s.getData().name);
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
            </ListItem >
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

        const findAssociatedModel = (modelId: string) => {
            const model = this.props.components.find(c =>
                c.getType() === ComponentType.STATIC_MODEL
                && c.getData().modelId === modelId
            );
            if (!model)
                throw new Error("Can't find inner model for id: " + modelId);
            else return model as FirebaseStaticModel;
        }

        const outerParameters = this.props.components
            .filter(c => c.getType() === ComponentType.PARAMETER);
        const innerParameters = this.props.inners.map(m => m.components
            .filter(c => c.getType() === ComponentType.PARAMETER)
            .map(p => findAssociatedModel(m.modelId).makeChild(p))
        ).flatMap(_ => _);
        const allParameters = outerParameters.concat(innerParameters);

        const replacedIds = this.props.substitutions.map(s => s.replacedId);

        const usedParameters = allParameters.filter(p =>
            !replacedIds.includes(p.getId())
        );

        return usedParameters.map((p, i) => itemFunc(p, i));
    }

    private makeOneDefaultParameterListItem(
        param: FirebaseParameter,
        key: number
    ): ReactElement {
        return this.makeOneParameterListItem(
            param.getData().text,
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

        // If a user names a parameter the same thing as a built-in method on
        // Object (e.g. "pop") and the scenario doesn't override it, then JS
        // will assume that the value is overridden and its value is a function,
        // which will crash the site. To avoid this, we have to check the type.
        function isValidOverrideValue(v: any): boolean {
            return v && v instanceof String;
        }

        if (!this.state.scenarioEditing) throw new Error("No scenario selected");

        const scenario = this.state.scenarioEditing;
        const paramName = param.getData().text;
        const overrideValue = scenario.getData().overrides[param.getData().text];
        const value = isValidOverrideValue(overrideValue)
            ? overrideValue
            : param.getData().value;
        const isGrayed = value === param.getData().value;

        const handleChange = (e: ReactChangeEvent) => {
            const oldOverrides =
                this.state.scenarioEditing!.getData().overrides;
            const newOverrides = {
                ...oldOverrides,
                [`${paramName}`]: e.target.value
            };
            if (e.target.value === param.getData().value)
                delete newOverrides[`${paramName}`];
            const newData = {
                ...this.state.scenarioEditing!.getData(),
                overrides: newOverrides
            };
            const newScenario = this.state.scenarioEditing!.withData(newData);
            this.setState({ scenarioEditing: newScenario });
        }

        return this.makeOneParameterListItem(
            param.getData().text,
            value,
            isGrayed,
            false,
            key,
            handleChange
        );
    }

    private makeStartStopTimeListItems(): ReactElement[] {
        const handleChange = (e: ReactChangeEvent, startTime: boolean) => {
            const newData = { ...scenario!.getData() };
            if (startTime) newData.startTime = e.target.value;
            else newData.stopTime = e.target.value;
            this.setState({
                scenarioEditing: scenario!.withData(newData)
            });
        }
        const scenario = this.state.scenarioEditing;
        const startTime = scenario ? scenario.getData().startTime : "0.0";
        const stopTime = scenario ? scenario.getData().stopTime : "0.0";

        const isDisabled = scenario === null;
        const isError = !ModelValidator.isValidNumber(startTime)
            || !ModelValidator.isValidNumber(stopTime)
            || Number(stopTime) < Number(startTime);

        return [
            this.makeOneParameterListItem(
                "Start Time",
                startTime,
                isDisabled,
                isDisabled,
                -1,
                e => handleChange(e, true),
                isError,
            ),
            this.makeOneParameterListItem(
                "Stop Time",
                scenario ? scenario.getData().stopTime : "0.0",
                isDisabled,
                isDisabled,
                -2,
                e => handleChange(e, false),
                isError,
            ),
        ];
    }

    private makeOneParameterListItem(
        name: string,
        value: string,
        isGrayed: boolean,
        isDisabled: boolean,
        key: number,
        handleChange?: (e: ReactChangeEvent) => void,
        isError: boolean = false,
    ): ReactElement {
        isError = isError || !ModelValidator.isValidNumber(value);
        const color = isGrayed
            ? theme.palette.grayed.main
            : theme.palette.canvas.contrastText;
        const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                this.updateScenario();
                document.body.focus();
            }
        }

        return (
            <ListItem key={key}>
                <TextField
                    value={value}
                    onChange={handleChange}
                    onKeyUp={handleKeyUp}
                    onBlur={() => this.refresh()}
                    name={name}
                    label={name}
                    error={isError}
                    inputProps={{
                        id: `${name}-editbox`,
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

    private refresh(): void {
        if (this.state.scenarioEditing) {
            const original = this.props.scenarios.find(s =>
                s.getId() === this.state.scenarioEditing!.getId()
            );
            if (original) {
                this.setState({ scenarioEditing: original });
            }
            else {
                console.error(
                    "Can't find scenario: " + this.state.scenarioEditing!.getId()
                );
                this.setState({ scenarioEditing: null });
            }
        }
    }

    private onScenarioSelectionChanged(event: SelectChangeEvent): void {
        this.startEditingScenario(event.target.value);
    }

    private onNewScenarioTextChanged(e: ReactChangeEvent): void {
        this.setState({ newScenarioName: e.target.value });
    }

    private addNewScenario(): void {
        const newScenarioName = this.state.newScenarioName;
        if (this.isValidScenarioName(newScenarioName)) {
            this.props.firebaseDataModel.addNewScenario(
                this.props.modelUuid,
                newScenarioName,
            ).then(() => this.startEditingScenario(newScenarioName));
            this.setState({ newScenarioName: "" });
        }
    }

    private startEditingScenario(name: string): void {
        const scenario = this.props.scenarios
            .find(s => s.getData().name === name);
        if (!scenario) throw new Error("Unknown scenario " + name);
        this.setState({
            scenarioEditing: scenario,
            originalScenario: scenario
        });
    }

    private updateScenario(): void {
        if (this.state.scenarioEditing) {
            this.props.firebaseDataModel.updateScenario(
                this.props.modelUuid,
                this.state.scenarioEditing
            );
        }
    }

    private deleteScenario(): void {
        if (this.state.scenarioEditing) {
            const scenario = this.state.scenarioEditing;
            this.setState({
                scenarioEditing: null,
                originalScenario: null
            }, () => this.props.deleteScenario(
                scenario,
                () => this.refresh()
            ));
        }
    }

    private isValidScenarioName(name: string): boolean {
        return name.length > 0 &&
            !this.props.scenarios
                .find(c => c.getData().name === this.state.newScenarioName);
    }
}
