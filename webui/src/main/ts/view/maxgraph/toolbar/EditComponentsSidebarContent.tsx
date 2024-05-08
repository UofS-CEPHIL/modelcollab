import { Button, Divider, List, ListItem, TextField } from '@mui/material';
import React, { ChangeEvent, KeyboardEvent, ReactElement } from 'react';
import ComponentType from '../../../data/components/ComponentType';
import FirebaseComponent from '../../../data/components/FirebaseComponent';
import FirebaseStaticModel from '../../../data/components/FirebaseStaticModel';
import FirebaseDataModel from '../../../data/FirebaseDataModel';
import EditTextListItem from './EditTextListItem';
import TypographyListItem from './TypographyListItem';
import EditColorListItem from './EditColorListItem';

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
        if (
            (prevProps.component === null && this.props.component !== null)
            || (prevProps.component !== null && this.props.component === null)
            || (
                prevProps.component
                && this.props.component
                && !prevProps.component.equals(this.props.component)
            )
        ) {
            this.setState({ currentComponent: this.props.component });
        }
    }

    public render(): ReactElement {
        return (
            <List>
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
                        this.makeFontEditListItem(),
                        this.makeColorEditListItem(),
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
                        this.makeFontEditListItem(),
                        this.makeColorEditListItem(),
                        this.makeTextBoxListItem("text", isInner, "Name"),
                        this.makeTextBoxListItem("value", isInner, "Value"),
                    ];
                case ComponentType.SUM_VARIABLE:
                case ComponentType.CLD_VERTEX:
                    return [
                        this.makeUnapplySubstitutionsButton(),
                        this.makeFontEditListItem(),
                        this.makeColorEditListItem(),
                        this.makeTextBoxListItem(
                            "text",
                            isInner,
                            "Name",
                            this.state.currentComponent.getType()
                            !== ComponentType.CLD_VERTEX
                        ),
                    ];
                case ComponentType.FLOW:
                    return [
                        this.makeUnapplySubstitutionsButton(),
                        this.makeFontEditListItem(),
                        this.makeColorEditListItem(),
                        this.makeTextBoxListItem("text", isInner, "Name"),
                        this.makeTextBoxListItem(
                            "equation",
                            isInner,
                            "Equation"
                        ),
                    ];
                case ComponentType.CONNECTION:
                case ComponentType.CLD_LINK:
                case ComponentType.LOOP_ICON:
                    return [
                        this.makeColorEditListItem(),
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

    private makeFontEditListItem(): ReactElement {
        return (
            <EditTextListItem
                fontSize={this.state.currentComponent?.getData().fontSize}
                bold={this.state.currentComponent?.getData().bold}
                italic={this.state.currentComponent?.getData().italic}
                underline={this.state.currentComponent?.getData().underline}
                onChange={(fs, b, i, u) =>
                    this.state.currentComponent &&
                    this.props.firebaseDataModel.updateComponent(
                        this.props.sessionId,
                        this.state.currentComponent.withData({
                            ...this.state.currentComponent?.getData(),
                            bold: b,
                            italic: i,
                            underline: u,
                            fontSize: fs,
                        }),
                    )}
                key={"editFont"}
            />
        );
    }

    private makeColorEditListItem(): ReactElement {
        return (
            <EditColorListItem
                color={this.state.currentComponent!.getData().color}
                onChange={color =>
                    this.props.firebaseDataModel.updateComponent(
                        this.props.sessionId,
                        this.state.currentComponent!.withData({
                            ...this.state.currentComponent!.getData(),
                            color
                        })
                    )
                }
                key={"editColor"}
            />
        );
    }

    private resetComponent(): void {
        this.setState({ currentComponent: this.props.component });
    }

    private makeTextBoxListItem(
        fieldName: string,
        disabled: boolean,
        text: string = fieldName,
        allowEmpty: boolean = true
    ): ReactElement {
        const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                var value = this.state.currentComponent!.getData()[fieldName];
                if (/^(\s+)?$/.test(value) && !allowEmpty) {
                    this.resetComponent();
                }
                else if (
                    this.state.currentComponent
                    && this.props.component
                    && !this.state.currentComponent.equals(this.props.component)
                ) {
                    this.props.firebaseDataModel.updateComponent(
                        this.props.sessionId,
                        this.state.currentComponent
                    );
                }
                document.body.focus();
            }
        }

        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
            this.setState({
                currentComponent: this.state.currentComponent?.withData({
                    ...this.state.currentComponent?.getData(),
                    [fieldName]: e.target.value
                }) ?? null
            })
        }

        return (
            <ListItem key={fieldName}>
                <TextField
                    value={this.state.currentComponent!.getData()[fieldName]}
                    onChange={handleChange}
                    name={text}
                    label={text}
                    error={false}
                    inputProps={{
                        id: `${fieldName}-editbox`,
                    }}
                    onKeyUp={handleKeyUp}
                    onBlur={() => this.resetComponent()}
                    disabled={disabled}
                    fullWidth
                />
            </ListItem>
        );
    }

    private makeUnapplySubstitutionsButton(): ReactElement | null {
        if (!this.state.currentComponent) return null;
        return (
            <ListItem key={"undoids"}>
                <Button
                    variant={"contained"}
                    fullWidth={true}
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
