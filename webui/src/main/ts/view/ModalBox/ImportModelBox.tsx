import { ListItem, ListItemText, ListItemButton } from '@mui/material';
import { ReactElement } from 'react';
import { ModelsList, ModelType } from '../../data/FirebaseDataModel';

import ButtonListBox, { Props, State as BaseState } from './ButtonListBox';


interface State extends BaseState {
    myModels: ModelsList;
    sharedModels: ModelsList;
    unsubscribe?: () => void;
}

export default class ImportModelBox extends ButtonListBox<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { myModels: {}, sharedModels: {} };
    }

    public componentWillUnmount(): void {
        if (this.state.unsubscribe) {
            this.state.unsubscribe();
            this.setState({ unsubscribe: undefined });
        }
    }

    public componentDidMount(): void {
        const unsubMine = this.props.firebaseDataModel.subscribeToOwnedModels(
            m => this.setState({ myModels: m })
        );
        const unsubOthers = this.props.firebaseDataModel.subscribeToSharedModels(
            m => {
                this.setState({ sharedModels: m })
            }
        );
        this.setState({
            unsubscribe: () => {
                unsubMine();
                unsubOthers();
            }
        });
    }

    protected makeListItems(): ReactElement[] {
        const allModels = { ...this.state.myModels, ...this.state.sharedModels }
        return Object.entries(allModels)
            .filter(([_, t]) => t.type === ModelType.StockFlow)
            .map(([uuid, nametype]) => (
                <ListItem disablePadding key={uuid}>
                    <ListItemButton
                        onClick={() => this.props.handleSubmit(uuid)}
                    >
                        <ListItemText primary={nametype.name} />
                    </ListItemButton>
                </ListItem>
            ));
    }
}
