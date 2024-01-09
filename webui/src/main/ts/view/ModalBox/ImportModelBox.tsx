import { ListItem, ListItemText, ListItemButton } from '@mui/material';
import { ReactElement } from 'react';

import ButtonListBox, { Props, State as BaseState } from './ButtonListBox';


interface State extends BaseState {
    savedModelNames: string[];
}

export default class ImportModelBox extends ButtonListBox<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { savedModelNames: [] };
    }

    public componentDidMount(): void {
        // TODO get available models
    }

    protected makeListItems(): ReactElement[] {
        return this.state.savedModelNames.map((name, i) => (
            <ListItem disablePadding key={i}>
                <ListItemButton onClick={() => this.props.handleSubmit(name)}>
                    <ListItemText primary={name} />
                </ListItemButton>
            </ListItem>
        ));
    }
}
