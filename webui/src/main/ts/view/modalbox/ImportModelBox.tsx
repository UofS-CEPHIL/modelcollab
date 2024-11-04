import { ListItem, ListItemText, ListItemButton, List, ListSubheader, Divider } from '@mui/material';
import { Component, ReactElement } from 'react';
import FirebaseDataModel, { ModelType } from '../../data/FirebaseDataModel';
import FirebaseModelsList from '../../data/FirebaseModelsList';
import FirebaseModelsManager from '../../data/FirebaseModelsManager';
import ModelMetadata from '../../data/ModelMetadata';
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
                { models: models.withDuplicatesFiltered() },
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

        const makeListItem = (m: ModelMetadata, keyPrefix: string) => (
            <ListItem disablePadding key={`${keyPrefix}::${m.modelId}`} >
                <ListItemButton
                    onClick={() => this.props.onModelSelected(m.modelId)}
                >
                    <ListItemText primary={m.modelName} />
                </ListItemButton>
            </ListItem >
        );

        return [
            (
                <ListSubheader key={"your-models-header"}>
                    Your Models
                </ListSubheader>
            ),
            ...[...this.state.models.ownedModels.values()].map(
                m => makeListItem(m, "owned")
            ),
            (<Divider key={"d1"} />),
            (
                <ListSubheader key={"shared-models-header"}>
                    Shared Models
                </ListSubheader>
            ),
            ...[...this.state.models.sharedModels.values()].map(
                m => makeListItem(m, "shared")
            ),
            (<Divider key={"d2"} />),
            (
                <ListSubheader key={"public-models-header"}>
                    Public Models
                </ListSubheader>
            ),
            ...[...this.state.models.publicModels.values()].map(
                m => makeListItem(m, "public")
            ),
        ];
    }
}
