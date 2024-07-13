import { ListItem, ListItemText, ListItemButton, List } from '@mui/material';
import { Component, ReactElement } from 'react';
import FirebaseDataModel, { ModelsList, ModelType } from '../../data/FirebaseDataModel';
import ButtonBox from './ButtonBox';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    onModelSelected: (uuid: string) => void;
    onCancel: () => void;
    width?: number;
}

export interface State {
    myModels: ModelsList;
    sharedModels: ModelsList;
    publicModels: ModelsList;
    unsubscribe?: () => void;
}

export default class ImportModelBox extends Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            myModels: {},
            sharedModels: {},
            publicModels: {}
        };
    }

    public componentWillUnmount(): void {
        if (this.state.unsubscribe) {
            this.state.unsubscribe();
            this.setState({ unsubscribe: undefined });
        }
    }

    public componentDidMount(): void {
        if (!this.state.unsubscribe) {
            const unsubscribe = this.props.firebaseDataModel
                .subscribeToAllAvailableModels(
                    m => this.setState({ myModels: m }),
                    m => this.setState({ sharedModels: m }),
                    m => this.setState({ publicModels: m }),
                );
            this.setState({ unsubscribe });
        }
    }

    public render(): ReactElement {
        return (
            <ButtonBox
                width={this.props.width}
                buttons={[{
                    label: "Cancel",
                    callback: () => this.props.onCancel()
                }]}
            >
                <List>
                    {this.makeListItems()}
                </List>
            </ButtonBox>
        );
    }

    protected makeListItems(): ReactElement[] {
        const allModels = {
            ...this.state.myModels,
            ...this.state.sharedModels,
            ...this.state.publicModels,
        }
        return Object.entries(allModels)
            .filter(([_, t]) => t.type === ModelType.StockFlow)
            .map(([uuid, nametype]) => (
                <ListItem disablePadding key={uuid}>
                    <ListItemButton
                        onClick={() => this.props.onModelSelected(uuid)}
                    >
                        <ListItemText primary={nametype.name} />
                    </ListItemButton>
                </ListItem>
            ));
    }
}
