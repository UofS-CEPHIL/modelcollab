import { Button, Divider, List, ListItem, ListItemButton, TextField, Typography } from '@mui/material';
import React, { ReactElement } from 'react';
import ComponentType from '../../../data/components/ComponentType';
import FirebaseComponent from '../../../data/components/FirebaseComponent';
import FirebaseStaticModel from '../../../data/components/FirebaseStaticModel';
import FirebaseDataModel from '../../../data/FirebaseDataModel';
import RefreshAndSaveListItem from './RefreshAndSaveListItem';
import TypographyListItem from './TypographyListItem';

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
                    key={-1}
                />
                {
                    this.props.component?.getType() &&
                    <TypographyListItem
                        text={
                            "Edit " +
                            this.props.component.getType().replaceAll("_", " ")
                        }
                        italic
                        bold
                        key={-2}
                    />
                }
                <Divider />
                {this.makeListItems()}
            </List>
        );
    }

    private makeListItems(): (ReactElement | null)[] {
        if (this.state.currentComponent) {
            const isInner = FirebaseStaticModel
                .isStaticModelChildId(this.state.currentComponent.getId());
            switch (this.state.currentComponent.getType()) {
                case ComponentType.STOCK:
                    return [
                        this.makeUnapplySubstitutionsButton(),
                        this.makeTextBoxListItem("text", isInner, "Name"),
                        this.makeTextBoxListItem(
                            "value",
                            isInner,
                            "Initial Value"
                        ),
                    ];
                case ComponentType.PARAMETER:
                case ComponentType.VARIABLE:
                    return [
                        this.makeUnapplySubstitutionsButton(),
                        this.makeTextBoxListItem("text", isInner, "Name"),
                        this.makeTextBoxListItem("value", isInner, "Value"),
                    ];
                case ComponentType.SUM_VARIABLE:
                    return [
                        this.makeUnapplySubstitutionsButton(),
                        this.makeTextBoxListItem("text", isInner, "Name")
                    ];
                case ComponentType.FLOW:
                    return [
                        this.makeUnapplySubstitutionsButton(),
                        this.makeTextBoxListItem("text", isInner, "Name"),
                        this.makeTextBoxListItem(
                            "equation",
                            isInner,
                            "Equation"
                        ),
                    ];
                default:
                    return [
                        <TypographyListItem
                            text={"Selected component not editable."}
                            italic
                            key={-3}
                        />
                    ];
            }
        }
        else {
            return [
                <TypographyListItem
                    text={"Select a component..."}
                    italic
                    key={-3}
                />
            ];
        }
    }

    private makeTextBoxListItem(
        fieldName: string,
        disabled: boolean,
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
                    disabled={disabled}
                />
            </ListItem>
        );
    }

    private makeUnapplySubstitutionsButton(): ReactElement | null {
        if (!this.state.currentComponent) return null;
        return (
            <ListItem key={-4}>
                <Button
                    variant={"contained"}
                    onClick={() =>
                        this.props.firebaseDataModel
                            .unidentifyAllComponents(
                                this.props.sessionId,
                                this.state.currentComponent!.getId()
                            )
                    }
                >
                    Undo Identifications
                </Button>
            </ListItem>
        );
    }
}
