import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonGroup, Grid, IconButton, ListItem, Stack, TextField } from '@mui/material';
import React, { ChangeEvent, KeyboardEvent, ReactElement } from 'react';

export interface Props {
    fontSize: number;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    onChange: (fs: number, b: boolean, i: boolean, u: boolean) => void;
}

export interface State {
    fontSizeValue: number;
}

export default class EditTextListItem extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = {
            fontSizeValue: this.props.fontSize,
        };
    }

    public componentDidUpdate(prevProps: Props): void {
        if (this.props.fontSize !== prevProps.fontSize) {
            this.setState({ fontSizeValue: this.props.fontSize });
        }
    }

    public render(): ReactElement {
        return (
            <ListItem>
                <Grid
                    container
                    direction={"row"}
                    spacing={1}
                    alignItems={"center"}
                >
                    <Grid xs={2} item>
                        {this.makeButton(
                            this.props.bold,
                            faBold,
                            () => this.props.onChange(
                                this.props.fontSize,
                                !this.props.bold,
                                this.props.italic,
                                this.props.underline
                            )
                        )}
                    </Grid>
                    <Grid xs={2} item>
                        {this.makeButton(
                            this.props.italic,
                            faItalic,
                            () => this.props.onChange(
                                this.props.fontSize,
                                this.props.bold,
                                !this.props.italic,
                                this.props.underline
                            )
                        )}
                    </Grid>
                    <Grid xs={2} item>
                        {this.makeButton(
                            this.props.underline,
                            faUnderline,
                            () => this.props.onChange(
                                this.props.fontSize,
                                this.props.bold,
                                this.props.italic,
                                !this.props.underline
                            )
                        )}
                    </Grid>
                    <Grid xs={6} item>
                        {this.makeFontSizePicker()}
                    </Grid>
                </Grid>
            </ListItem >
        );
    }

    private makeButton(
        active: boolean,
        icon: IconDefinition,
        onClick: () => void,
    ): ReactElement {
        return (
            <IconButton
                color={active ? "primary" : "default"}
                onClick={onClick}
            >
                <FontAwesomeIcon icon={icon} />
            </IconButton>
        );
    }

    private makeFontSizePicker(): ReactElement {
        const updateFontSizeValue = (e: ChangeEvent<HTMLInputElement>) => {
            const fontSizeValue: number = parseInt(e.target.value);
            if (
                !isNaN(fontSizeValue)
                || /^(\s+)?$/.test(e.target.value)
            ) {
                this.setState({ fontSizeValue });
            }
        }

        const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                if (!isNaN(this.state.fontSizeValue)) {
                    this.props.onChange(
                        this.state.fontSizeValue,
                        this.props.bold,
                        this.props.italic,
                        this.props.underline
                    );
                }
                else {
                    this.setState({ fontSizeValue: this.props.fontSize });
                }
                document.body.focus();
            }
        }

        const handleLoseFocus = () => {
            this.setState({ fontSizeValue: this.props.fontSize });
        }

        return (
            <Stack
                direction={"row"}
                alignContent={"center"}
                alignItems={"center"}
            >
                <TextField
                    value={
                        isNaN(this.state.fontSizeValue)
                            ? ""
                            : this.state.fontSizeValue
                    }
                    maxRows={1}
                    sx={{ minWidth: 10 }}
                    label={"Size"}
                    onChange={updateFontSizeValue}
                    onKeyUp={handleKeyUp}
                    onBlur={handleLoseFocus}
                />
                <ButtonGroup
                    orientation={"vertical"}
                    variant={"contained"}
                    size={"small"}
                >
                    <Button
                        size={"xsmall"}
                        onClick={() => this.props.onChange(
                            Number(this.props.fontSize) + 1,
                            this.props.bold,
                            this.props.italic,
                            this.props.underline
                        )}
                    >
                        +
                    </Button>
                    <Button
                        size={"xsmall"}
                        onClick={() => this.props.onChange(
                            Number(this.props.fontSize) - 1,
                            this.props.bold,
                            this.props.italic,
                            this.props.underline
                        )}
                    >
                        -
                    </Button>
                </ButtonGroup>
            </Stack>
        );
    }
}
