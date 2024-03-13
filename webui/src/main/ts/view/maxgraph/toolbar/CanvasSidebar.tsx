import { Paper, ListItem, List, FormControl, InputLabel, Select, SelectChangeEvent, MenuItem, Divider } from '@mui/material';
import React, { ReactElement } from 'react';
import FirebaseComponent from '../../../data/components/FirebaseComponent';
import FirebaseDataModel from '../../../data/FirebaseDataModel';
import SidebarDragHandle from "./SidebarDragHandle";

export interface Props {
    onResize: (widthPx: number) => void;
    getIsVisible: () => boolean;
    firebaseDataModel: FirebaseDataModel;
    modelUuid: string;
    components: FirebaseComponent[],
    selectedComponent: FirebaseComponent | null;
}

export interface State {
    mode: string;
}

export default abstract class CanvasSidebar
    <P extends Props, S extends State>
    extends React.Component<P, S>
{

    public static readonly MIN_WIDTH_PX = 50;
    public static readonly MAX_WIDTH_PX = 800;
    public static readonly DEFAULT_WIDTH_PX = 300;
    public static readonly DEFAULT_VISIBILITY = false;

    private static readonly MODE_SELECT_LABEL_ID = "mode-select-label"
    private static readonly MODE_SELECT_PICKER_ID = "mode-selection"

    protected abstract makeInitialState(): S;
    protected abstract getModes(): string[];
    protected abstract makeSidebarContent(): ReactElement;

    public constructor(props: P) {
        super(props);
        this.state = this.makeInitialState();
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
                                        labelId={
                                            CanvasSidebar.MODE_SELECT_LABEL_ID
                                        }
                                        id={CanvasSidebar.MODE_SELECT_PICKER_ID}
                                        value={this.state.mode}
                                        label="Mode"
                                        onChange={e =>
                                            this.handleModeChanged(e)
                                        }
                                    >
                                        {
                                            this.getModes().map(m =>
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
                        {this.makeSidebarContent()}
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
            mode: event.target.value.toString()
        });
    }
}
