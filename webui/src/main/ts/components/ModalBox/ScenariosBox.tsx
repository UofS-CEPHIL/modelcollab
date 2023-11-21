import { ReactElement } from 'react';
import ButtonListBox, { Props as BaseProps, State as BaseState } from "../ButtonListBox/ButtonListBox";

import { FirebaseComponentModel as schema } from "database/build/export";

import FirebaseDataModel from '../../data/FirebaseDataModel';
import { Button, ListItem, ListItemText, TextField } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

export interface Props extends BaseProps {
    handleCancel: () => void;
    handleSubmit: (selected: string) => void;
    handleEdit: (name: string) => void;
    generateNewId: () => string;
    database: FirebaseDataModel;
    initialSelected: string | null;
    sessionId: string;
}

export interface State extends BaseState {
    selected: string | null;
    scenarios: schema.ScenarioFirebaseComponent[];
    newScenarioName: string;
}

export default class ScenariosBox extends ButtonListBox<Props, State> {

    public static readonly DEFAULT_SCENARIO_NAME = "baseline";

    public constructor(props: Props) {
        super(props);
        this.state = { scenarios: [], selected: this.props.initialSelected, newScenarioName: '' };
    }

    componentDidMount(): void {
        this.props.database.subscribeToSession(
            this.props.sessionId,
            cpts => this.setState({ ...this.state, scenarios: this.findScenarios(cpts) })
        );
    }

    private findScenarios(components: schema.FirebaseDataComponent<any>[]): schema.ScenarioFirebaseComponent[] {
        return components
            .filter(c => c.getType() === schema.ComponentType.SCENARIO);
    }

    private handleDelete(name: string): void {
        const scenario = this.state.scenarios.find(s => s.getData().name === name);
        if (!scenario) throw new Error("Unable to find scenario for deletion: " + name);
        this.props.database.removeComponent(this.props.sessionId, scenario.getId());
    }

    private handleChangeSelected(name: string | null): void {
        this.setState({ ...this.state, selected: name })
    }

    private handleSubmit(): void {
        this.props.handleSubmit(this.state.selected || "");
    }

    private handleAddScenario(): void {
        this.props.database.updateComponent(
            this.props.sessionId,
            new schema.ScenarioFirebaseComponent(
                this.props.generateNewId(),
                {
                    name: this.state.newScenarioName,
                    paramOverrides: {}
                }
            )
        );
    }

    private isValidScenarioName(name: string): boolean {
        return name.length > 0 &&
            this.state.scenarios.find(c => c.getData().name === this.state.newScenarioName) === undefined
            && name !== ScenariosBox.DEFAULT_SCENARIO_NAME;
    }

    protected makeListItems(): ReactElement[] {
        const defaultScenarioListItem = (
            <ListItem disablePadding key={-1}>
                <ListItemText primary={ScenariosBox.DEFAULT_SCENARIO_NAME} />
                <Button
                    onClick={() => this.handleChangeSelected(null)}
                    color={!this.state.selected ? "secondary" : "primary"}
                >
                    <CheckIcon />
                </Button>
            </ListItem>
        );
        const addScenarioListItem = (
            <ListItem disablePadding key={-2}>
                <TextField
                    label={"New Scenario"}
                    value={this.state.newScenarioName}
                    error={this.isValidScenarioName(this.state.newScenarioName)}
                    onChange={s => this.setState({ ...this.state, newScenarioName: s.target.value })}
                />
                <Button
                    onClick={() => this.isValidScenarioName(this.state.newScenarioName) && this.handleAddScenario()}
                >
                    <AddIcon />
                </Button>
            </ListItem>
        );
        const submitButtonListItem = (
            <ListItem disablePadding key={-3}>
                <Button
                    onClick={() => this.handleSubmit()}
                >
                    Submit
                </Button>
            </ListItem>
        );
        const scenarioItems = this.state.scenarios
            .map(s => s.getData().name)
            .map((name, i) => (
                <ListItem disablePadding key={i}>
                    <ListItemText primary={name} />
                    <Button
                        onClick={() => this.handleDelete(name)}
                    >
                        <DeleteIcon />
                    </Button>
                    <Button
                        onClick={() => this.props.handleEdit(name)}
                    >
                        <EditIcon />
                    </Button>
                    <Button
                        onClick={() => this.handleChangeSelected(name)}
                        color={this.state.selected === name ? "secondary" : "primary"}
                    >
                        <CheckIcon />
                    </Button>
                </ListItem>
            ));

        return [addScenarioListItem, defaultScenarioListItem, ...scenarioItems, submitButtonListItem];
    }
}
