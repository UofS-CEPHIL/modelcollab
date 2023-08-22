import React, { ReactElement } from 'react';
import Box from '@mui/material/Box';
import { CssBaseline, Divider, Drawer, List, ListItem, Typography } from '@mui/material';

import { UiMode } from '../../UiMode';
import RestClient from '../../rest/RestClient';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import ToolbarButtons from "./CanvasScreenToolbarButtons";
import MainToolbarButtons from './MainToolbarButtons';
import SemanticSelectToolbarButtons from './SemanticsSelectToolbarButtons';

export interface Props {
    mode: UiMode,
    setMode: (_: UiMode) => void
    sessionId: string;
    selectedScenario: string | null;
    returnToSessionSelect: () => void;
    downloadData: (b: Blob, fileName: string) => void;
    saveModel: () => void;
    importModel: () => void;
    showScenarios: () => void;
    showHelpBox: () => void;
    restClient: RestClient;
    firebaseDataModel: FirebaseDataModel;
}

export interface State {
    waitingForResults: boolean;
    toolbarButtons: ToolbarButtons;
}


export default class CanvasScreenToolbar extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            waitingForResults: false,
            toolbarButtons: this.makeInitialToolbarButtons()
        };
    }

    public render(): ReactElement {
        return (
            <Box sx={{ display: "flex" }} >
                <CssBaseline />
                <Drawer variant="permanent" open={true}>
                    <ListItem
                        disablePadding
                        sx={{ display: 'block' }}
                    >
                        <Typography variant="h5" sx={{ "text-align": 'center' }}>
                            {this.props.sessionId}
                        </Typography>
                    </ListItem>
                    <Divider />
                    <List>
                        {
                            this.state.toolbarButtons
                                .getButtons(
                                    this.props.mode,
                                    this.state.waitingForResults
                                )
                        }
                    </List>
                </Drawer>
            </Box>
        );
    }

    private makeMainToolbarButtons(props: Props): MainToolbarButtons {
        return new MainToolbarButtons(
            props.restClient,
            props.sessionId,
            (b, f) => props.downloadData(b, f),
            props.firebaseDataModel,
            m => props.setMode(m),
            () => props.showScenarios(),
            () => props.saveModel(),
            () => props.importModel(),
            () => props.showHelpBox(),
            () => props.returnToSessionSelect(),
            () => this.setState({ ...this.state, toolbarButtons: this.makeSemanticSelectToolbarButtons() })
        );
    }

    private makeInitialToolbarButtons(): MainToolbarButtons {
        return this.makeMainToolbarButtons(this.props);
    }

    private makeSemanticSelectToolbarButtons(): SemanticSelectToolbarButtons {
        return new SemanticSelectToolbarButtons(
            this.props.sessionId,
            () => this.setState({ ...this.state, toolbarButtons: this.makeMainToolbarButtons(this.props) }),
            this.props.restClient,
            this.props.selectedScenario,
            this.props.downloadData,
            this.state.waitingForResults,
            b => this.setState({ ...this.state, waitingForResults: b })
        );
    }
}
