import React, { ReactElement } from 'react';
import { UiMode } from '../../UiMode';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';


export interface Props {
    mode: UiMode;
    open: boolean;
}


export default abstract class CanvasScreenToolbarButtons {

    public abstract getButtons(isOpen: boolean): ReactElement[];

    public abstract handleBackButtonPressed(): void;

    protected mode: string;

    protected open: boolean;

    public constructor(mode: string, open: boolean) {
        this.mode = mode;
        this.open = open;
    }

    protected makeToolbarButton(
        text: string,
        onClick: (e: React.MouseEvent) => void,
        isOpen: boolean,
        icon?: ReactElement
    ): ReactElement {
        const isSelected = (mode: string) => this.mode.toString() === mode;
        return (
            <ListItem key={text} disablePadding sx={{ display: 'block' }} id={text} >
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: this.open ? 'initial' : 'center',
                        px: 2.5
                    }}
                    onClick={e => onClick(e)}
                    selected={isSelected(text)}
                    id={text}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: this.open ? 3 : 'auto',
                            justifyContent: 'center',
                        }}
                        id={text}
                    >
                        {icon}
                    </ListItemIcon>
                    <ListItemText primary={text} sx={{ opacity: isOpen ? 1 : 0 }} />
                </ListItemButton>
            </ListItem >
        );
    }
}
