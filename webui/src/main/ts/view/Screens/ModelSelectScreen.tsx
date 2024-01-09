import { Button, Divider, List, ListItem, ListItemButton, ListItemText, ListSubheader, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import React, { ReactElement } from 'react';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { Link } from 'react-router-dom';
import { theme } from '../../Themes';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
}

export interface State {
    models: { [uuid: string]: string };
    newModelText: string;
}

export default class ModelSelectScreen extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { models: {}, newModelText: "" };
    }

    public componentDidMount() {
        this.refreshModelList();
    }

    public render(): ReactElement {
        return (
            <List>
                <ListItem key={-1}>
                    <TextField
                        label="New model"
                        value={this.state.newModelText}
                        error={
                            Object.values(this.state.models)
                                .includes(this.state.newModelText)
                        }
                        onChange={s =>
                            this.setState({ newModelText: s.target.value })
                        }
                    />
                    <Button
                        onClick={() => this.addModel(this.state.newModelText)}
                        variant={"contained"}>
                        <AddIcon />
                    </Button>
                </ListItem>
                <Divider />
                <ListSubheader key={-2}>
                    Your Models
                </ListSubheader>
                {
                    Object.entries(this.state.models).map(
                        (e, i) => (
                            <ListItem
                                component={Link}
                                to={`/${e[0]}`}
                                style={{ color: theme.palette.text.primary }}
                                key={i}
                            >
                                <ListItemButton>
                                    <ListItemText primary={e[1]} />
                                </ListItemButton>
                            </ListItem>
                        )
                    )
                }
                <Divider />
                <ListSubheader key={-3}>
                    Shared With You
                </ListSubheader>
            </List >
        );
    }

    private addModel(name: string) {
        if (!Object.values(this.state.models).includes(name)) {
            this.props.firebaseDataModel.addStockFlowModel(name);
            this.setState({ newModelText: "" });
            this.refreshModelList();
        }
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
