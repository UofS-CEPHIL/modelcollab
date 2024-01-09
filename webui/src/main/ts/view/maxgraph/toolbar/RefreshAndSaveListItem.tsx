import { ListItem, ListItemButton, ListItemIcon } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import React, { ReactElement } from 'react';

export interface Props {
    onRefresh: () => void;
    onSave: () => void;
    disabled: boolean;
    key: any;
}

export default class RefreshAndSaveListItem extends React.Component<Props> {
    public render(): ReactElement {
        return (
            <ListItem>
                <ListItemButton
                    onClick={() => this.props.onSave()}
                    sx={{ justifyContent: "center" }}
                    disabled={this.props.disabled}
                >
                    <ListItemIcon sx={{ justifyContent: "center" }}>
                        <SaveIcon />
                    </ListItemIcon>
                </ListItemButton>
                <ListItemButton
                    onClick={() => this.props.onRefresh()}
                    sx={{ justifyContent: "center" }}
                    disabled={this.props.disabled}
                >
                    <ListItemIcon sx={{ justifyContent: "center" }}>
                        <RefreshIcon />
                    </ListItemIcon>
                </ListItemButton>
            </ListItem>
        );
    }
}
