import React, { ReactElement } from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import FirebaseScenario from '../../../data/components/FirebaseScenario';
import TypographyListItem from './TypographyListItem';

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
                <TypographyListItem
                    text={"No scenarios..."}
                    italic
                    key={1}
                />
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
