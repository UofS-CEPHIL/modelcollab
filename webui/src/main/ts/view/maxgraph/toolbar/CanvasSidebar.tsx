import { Paper, ListItem, List, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, Divider } from '@mui/material';
import React, { ReactElement } from 'react';
import ComponentType from '../../../data/components/ComponentType';
import FirebaseComponent from '../../../data/components/FirebaseComponent';
import FirebaseScenario from '../../../data/components/FirebaseScenario';
import FirebaseDataModel from '../../../data/FirebaseDataModel';
import EditScenariosSidebarContent from './EditScenariosSidebarContent';
import SelectScenarioSidebarContent from "./SelectScenarioSidebarContent";
import SidebarDragHandle from "./SidebarDragHandle";

export enum SidebarMode {
    EDIT_SCENARIOS = "Edit Scenarios",
    SELECT_SCENARIO = "Select Scenario"
}

export interface Props {
    onResize: (widthPx: number) => void;
    getIsVisible: () => boolean;
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    getComponents: () => FirebaseComponent[];
    getSelectedScenario: () => string;
    selectScenario: (s: string) => void;
    deleteScenario: (s: FirebaseScenario, callback: () => void) => void;
}

export interface State {
    mode: SidebarMode;
}

export default class CanvasSidebar extends React.Component<Props, State> {

    public static readonly MIN_WIDTH_PX = 50;
    public static readonly MAX_WIDTH_PX = 800;
    public static readonly DEFAULT_WIDTH_PX = 300;
    public static readonly DEFAULT_VISIBILITY = false;
    public static readonly DEFAULT_MODE = SidebarMode.EDIT_SCENARIOS;

    private static readonly MODE_SELECT_LABEL_ID = "mode-select-label"
    private static readonly MODE_SELECT_PICKER_ID = "mode-selection"

    public constructor(props: Props) {
        super(props);
        this.state = { mode: CanvasSidebar.DEFAULT_MODE };
    }

    public render(): ReactElement {
        return this.props.getIsVisible() ?
            (
                <Paper
                    sx={{
                        p: 2,
                        position: "relative",
                        height: "calc(100vh - 64px)"
                    }}
                >
                    <nav aria-label="mode-select-listitem" key="modeselect-nav">
                        <List>
                            <ListItem key="mode-select">
                                <FormControl fullWidth variant="standard">
                                    <InputLabel
                                        id={CanvasSidebar.MODE_SELECT_LABEL_ID}
                                    >
                                        Mode
                                    </InputLabel>
                                    <Select
                                        labelId={CanvasSidebar.MODE_SELECT_LABEL_ID}
                                        id={CanvasSidebar.MODE_SELECT_PICKER_ID}
                                        value={this.state.mode}
                                        label="Mode"
                                        onChange={e => this.handleModeChanged(e)}
                                    >
                                        {
                                            Object.values(SidebarMode).map(m =>
                                                <MenuItem
                                                    value={m}
                                                    key={m}
                                                >
                                                    {m}
                                                </MenuItem>
                                            )
                                        }
                                    </Select>
                                </FormControl>
                            </ListItem>
                        </List>
                    </nav>
                    <Divider key="divider1" />
                    <nav aria-label="sidebar-content" key="content-nav">
                        {this.makeContentForMode()}
                    </nav>
                    <SidebarDragHandle
                        onChangeWidth={w => this.props.onResize(w)}
                    />
                </Paper >
            )
            : (<div />);
    }

    private handleModeChanged(event: SelectChangeEvent): void {
        this.setState({
            mode: event.target.value as SidebarMode
        });
    }

    private makeContentForMode(): ReactElement {
        switch (this.state.mode) {
            case SidebarMode.EDIT_SCENARIOS:
                return (
                    <EditScenariosSidebarContent
                        firebaseDataModel={this.props.firebaseDataModel}
                        sessionId={this.props.sessionId}
                        deleteScenario={this.props.deleteScenario}
                    />
                );
            case SidebarMode.SELECT_SCENARIO:
                const scenarios = this.props.getComponents().filter(c =>
                    c.getType() === ComponentType.SCENARIO
                );
                const selected = scenarios.find(s =>
                    s.getData().name === this.props.getSelectedScenario()
                );
                return (
                    <SelectScenarioSidebarContent
                        scenarios={scenarios}
                        selected={selected}
                        onSelectionChanged={s =>
                            this.props.selectScenario(s.getData().name)
                        }
                    />
                );
            default:
                console.error("Unrecognized sidebar mode: " + this.state.mode);
                return (<div />);
        }
    }
}
