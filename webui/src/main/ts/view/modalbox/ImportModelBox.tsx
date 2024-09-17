import { ListItem, ListItemText, ListItemButton, List } from '@mui/material';
import { Component, ReactElement } from 'react';
import FirebaseDataModel, { ModelType } from '../../data/FirebaseDataModel';
import FirebaseModelsList from '../../data/FirebaseModelsList';
import FirebaseModelsManager from '../../data/FirebaseModelsManager';
import ButtonBox from './ButtonBox';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    onModelSelected: (uuid: string) => void;
    onCancel: () => void;
    width?: number;
}

export interface State {
    models: FirebaseModelsList;
}

export default class ImportModelBox extends Component<Props, State> {

    private modelsManager?: FirebaseModelsManager;

    public constructor(props: Props) {
        super(props);
        this.state = {
            models: FirebaseModelsList.EMPTY
        };
    }

    public componentWillUnmount(): void {
        this.modelsManager?.unsubscribe();
        this.modelsManager = undefined;
        this.setState({ models: FirebaseModelsList.EMPTY });
    }

    public componentDidMount(): void {
        this.modelsManager = new FirebaseModelsManager(
            this.props.firebaseDataModel,
            () => this.state.models,
            models => this.setState(
                { models },
                () => this.modelsManager?.notifyDataUpdated()
            )
        );
        this.modelsManager.subscribe();
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
                <div style={{ maxHeight: "300px", overflow: "auto" }}>
                    <List>
                        {this.makeListItems()}
                    </List>
                </div>
            </ButtonBox>
        );
    }

    protected makeListItems(): ReactElement[] {
        const allModels = [
            ...this.state.models.publicModels.values(),
            ...this.state.models.sharedModels.values(),
            ...this.state.models.publicModels.values(),
        ];
        return allModels
            .filter(m => m.modelType === ModelType.StockFlow)
            .map(m => (
                <ListItem disablePadding key={m.modelId}>
                    <ListItemButton
                        onClick={() => this.props.onModelSelected(m.modelId)}
                    >
                        <ListItemText primary={m.modelName} />
                    </ListItemButton>
                </ListItem>
            ));
    }
}
