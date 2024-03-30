import { ListItem, ListItemText, ListItemButton } from '@mui/material';
import { ReactElement } from 'react';
import { ModelType } from '../../data/FirebaseDataModel';

import ButtonListBox, { Props, State as BaseState } from './ButtonListBox';


interface State extends BaseState {
    availableModels: { [uuid: string]: string };
}

export default class ImportModelBox extends ButtonListBox<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { availableModels: {} };
    }

    public componentDidMount(): void {
        this.props.firebaseDataModel
            .getOwnedModels()
            .then(models => this.setState({
                availableModels: Object.fromEntries(
                    Object.entries(models)
                        .filter(([_, nametype]) =>
                            nametype.modelType === ModelType.StockFlow
                        ).map(([uuid, nametype]) =>
                            [uuid, nametype.name]
                        )
                )
            }));
    }

    protected makeListItems(): ReactElement[] {
        return Object.entries(this.state.availableModels)
            .map(([uuid, name]) => (
                <ListItem disablePadding key={uuid}>
                    <ListItemButton
                        onClick={() => this.props.handleSubmit(uuid)}
                    >
                        <ListItemText primary={name} />
                    </ListItemButton>
                </ListItem>
            ));
    }
}
