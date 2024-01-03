import { List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import ComponentType from '../../../data/components/ComponentType';
import FirebaseComponent from '../../../data/components/FirebaseComponent';
import FirebaseDataModel from '../../../data/FirebaseDataModel';
import RefreshAndSaveListItem from './RefreshAndSaveListItem';

export interface Props {
    component: FirebaseComponent | null;
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
}

export interface State {
    currentComponent: FirebaseComponent | null;
}

export default class EditComponentsSidebarContent
    extends React.Component<Props, State>
{

    public constructor(props: Props) {
        super(props);
        this.state = { currentComponent: this.props.component };
    }

    public componentDidUpdate(prevProps: Props): void {
        const curId = this.props.component?.getId();
        const prevId = prevProps.component?.getId();
        if (curId !== prevId) {
            this.setState({ currentComponent: this.props.component });
        }
    }

    public render(): ReactElement {
        return (
            <List>
                <RefreshAndSaveListItem
                    onRefresh={() =>
                        this.setState({ currentComponent: this.props.component })
                    }
                    onSave={() =>
                        this.state.currentComponent &&
                        this.props.firebaseDataModel.updateComponent(
                            this.props.sessionId,
                            this.state.currentComponent
                        )
                    }
                    disabled={this.props.component === null}
                />
                {
                    this.props.component?.getType() &&
                    this.makeTypographyListItem(
                        "Edit " + this.props.component.getType(),
                        true,
                        true
                    )
                }
                {this.makeListItems()}
            </List>
        );
    }

    private makeListItems(): ReactElement[] {
        if (this.state.currentComponent) {
            switch (this.state.currentComponent.getType()) {
                case ComponentType.STOCK:
                    return [
                        this.makeTextBoxListItem("text", "Name"),
                        this.makeTextBoxListItem("initvalue", "Initial Value"),
                    ];
                case ComponentType.PARAMETER:
                case ComponentType.VARIABLE:
                    return [
                        this.makeTextBoxListItem("text", "Name"),
                        this.makeTextBoxListItem("value", "Value"),
                    ];
                case ComponentType.SUM_VARIABLE:
                    return [
                        this.makeTextBoxListItem("text", "Name")
                    ];
                case ComponentType.FLOW:
                    return [
                        this.makeTextBoxListItem("text", "Name"),
                        this.makeTextBoxListItem("equation", "Equation"),
                    ];
                default:
                    return [this.makeTypographyListItem(
                        "Selected component not editable",
                        true
                    )];
            }
        }
        else {
            return [this.makeTypographyListItem(
                "Select a component...",
                true
            )];
        }
    }

    private makeTextBoxListItem(
        fieldName: string,
        text: string = fieldName
    ): ReactElement {
        return (
            <ListItem key={fieldName}>
                <TextField
                    value={this.state.currentComponent!.getData()[fieldName]}
                    onChange={e => this.setState({
                        currentComponent: this.state.currentComponent?.withData({
                            ...this.state.currentComponent?.getData(),
                            [fieldName]: e.target.value
                        }) ?? null
                    })}
                    name={text}
                    label={text}
                    error={false}
                    inputProps={{
                        id: `${fieldName}-editbox`,
                    }}
                />
            </ListItem>
        );
    }

    private makeTypographyListItem(
        text: string,
        italic: boolean = false,
        bold: boolean = false
    ): ReactElement {
        return (
            <ListItem key={0}>
                <ListItemText>
                    <Typography
                        variant="h6"
                        fontStyle={italic ? "italic" : ""}
                        fontWeight={bold ? "bold" : ""}
                    >
                        {text}
                    </Typography>
                </ListItemText>
            </ListItem>
        );
    }
}
