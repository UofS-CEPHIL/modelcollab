import React, { ReactElement } from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import FirebaseScenario from '../../../data/components/FirebaseScenario';

export interface Props {
    scenarios: FirebaseScenario[];
    selected: FirebaseScenario | undefined;
    onSelectionChanged: (s: FirebaseScenario) => void;
}

export default class SelectScenarioSidebarContent extends React.Component<Props> {

    public render(): ReactElement {
        return (
            <List>
                {this.makeScenarioListItems()}
            </List>
        );
    }

    private makeScenarioListItems(): ReactElement[] {

        if (this.props.scenarios.length == 0) {
            return [
                <ListItem key={0}>
                    <ListItemText>
                        <Typography
                            variant='h6'
                            component='div'
                            fontStyle='italic'
                        >
                            No scenarios...
                        </Typography>
                    </ListItemText>
                </ListItem>

            ];
        }
        else {
            return this.props.scenarios.map((s, i) =>
                <ListItem key={i}>
                    <ListItemButton
                        selected={
                            this.props.selected && s.getId()
                            === this.props.selected.getId()
                        }
                        onClick={() => this.props.onSelectionChanged(s)}
                    >
                        <ListItemText>
                            <Typography
                                variant='h6'
                                component='div'
                            >
                                {s.getData().name}
                            </Typography>
                        </ListItemText>
                    </ListItemButton>
                </ListItem>
            );
        }
    }

}
