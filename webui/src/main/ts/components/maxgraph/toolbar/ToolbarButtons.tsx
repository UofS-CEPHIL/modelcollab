import { Component, ReactElement } from 'react';
import { UiMode } from '../../../UiMode';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from '@mui/material';

export default abstract class ToolbarButtons<T> extends Component<T> {

    public render(): ReactElement {
        return (
            <List>
                {this.getButtons()}
            </List>
        );
    }

    public isSelected(buttonText: string, mode?: string): boolean {
        return mode !== undefined && mode.toString() === buttonText;
    }

    protected abstract getButtons(): ReactElement[];

    protected makeToolbarButton(
        text: string,
        onClick: (e: React.MouseEvent) => void,
        isOpen: boolean,
        icon?: ReactElement,
        mode?: UiMode
    ): ReactElement {
        return (
            <ListItem
                key={text}
                disablePadding
                sx={{
                    display: 'block',
                    backgroundColor: this.isSelected(text, mode) ? "rgba(39, 84, 245, 0.08)" : "white"
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
                    selected={this.isSelected(text, mode)}
                    id={text}
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
                    <ListItemText
                        primary={text}
                        sx={{ opacity: isOpen ? 1 : 0 }}
                    />
                </ListItemButton>
            </ListItem >
        );
    }
}
