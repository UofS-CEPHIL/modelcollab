import React, { ReactElement } from 'react';
import { UiMode } from '../../UiMode';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';


export interface Props {
    mode: UiMode;
    open: boolean;
}


export default abstract class CanvasScreenToolbarButtons {

    public abstract getButtons(isOpen: boolean, mode: string, waitingForResults: boolean): ReactElement[];

    public abstract handleBackButtonPressed(): void;

    public isSelected(buttonText: string, mode: string): boolean {
        return mode.toString() === buttonText;
    }

    protected makeToolbarButton(
        text: string,
        onClick: (e: React.MouseEvent) => void,
        isOpen: boolean,
        mode: string,
        icon?: ReactElement
    ): ReactElement {
        const selected = this.isSelected(text, mode)
        return (
            <ListItem
                key={text}
                disablePadding
                sx={{
                    display: 'block',
                    background: selected ? "LightGrey" : "White"
                }}
                id={text}
            >
                <ListItemButton
                    sx={{
                        minHeight: 48,
                        justifyContent: isOpen ? 'initial' : 'center',
                        px: 2.5
                    }}
                    onClick={e => onClick(e)}
                    id={text}
                    selected={selected}
                >
                    <ListItemIcon
                        sx={{
                            mr: isOpen ? 3 : 'auto',
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
