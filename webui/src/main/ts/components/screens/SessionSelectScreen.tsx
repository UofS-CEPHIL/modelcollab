import { Button, List, ListItem, ListItemButton, ListItemText, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React, { ReactElement } from 'react';
import FirebaseDataModel from '../../data/FirebaseDataModel';

export interface Props {
    firebaseData: FirebaseDataModel;
    openSession: (s: string) => void;
}

export interface State {
    sessions: string[];
    newSessionText: string;
}

export default class SessionSelectScreen extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { sessions: [], newSessionText: "" };
    }

    public componentDidMount() {
        this.props.firebaseData.subscribeToSessionList(
            sessions => {
                this.setState({ ...this.state, sessions });
            }
        );
    }

    public render(): ReactElement {
        return (
            <List>
                <ListItem disablePadding key={-1}>
                    <TextField
                        label="New session"
                        value={this.state.newSessionText}
                        error={this.state.sessions.includes(this.state.newSessionText)}
                        onChange={s => this.setState({ ...this.state, newSessionText: s.target.value })}
                    />
                    <Button onClick={() => this.addSession(this.state.newSessionText)} variant={"contained"}>
                        <AddIcon />
                    </Button>
                </ListItem>
                {
                    this.state.sessions.map(
                        (s, i) => (
                            <ListItem disablePadding key={i}>
                                <ListItemButton onClick={_ => this.props.openSession(s)}>
                                    <ListItemText primary={s} />
                                </ListItemButton>
                            </ListItem>
                        )
                    )
                }
            </List>
        );
    }

    private addSession(s: string) {
        if (!this.state.sessions.includes(s)) {
            this.props.firebaseData.addSession(s);
            this.setState({ ...this.state, sessions: [...this.state.sessions, s], newSessionText: "" });
        }
    }

}
