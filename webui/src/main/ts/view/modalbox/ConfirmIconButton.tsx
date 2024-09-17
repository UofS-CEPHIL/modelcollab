import { IconButton, IconButtonProps, Typography } from '@mui/material';
import { Component, MouseEvent, ReactElement } from 'react';
import { theme } from '../../Themes';

export type Props = IconButtonProps & {
    confirmColor?: string;
    defaultColor?: string;
    waitMs?: number;
    fadeMs?: number;
}

export interface State {
    wasClicked: boolean;
    startedFading: boolean;
}

export default class ConfirmIconButton extends Component<Props, State> {

    public static readonly DEFAULT_WAIT_MS = 2000;

    public static readonly DEFAULT_FADE_MS = 2000;

    public constructor(props: Props) {
        super(props);
        this.state = {
            wasClicked: false,
            startedFading: false,
        };
    }

    public render(): ReactElement {

        const wait =
            this.props.waitMs ?? ConfirmIconButton.DEFAULT_WAIT_MS;
        const fade =
            this.props.fadeMs ?? ConfirmIconButton.DEFAULT_FADE_MS;

        const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
            if (this.props.onClick) {
                if (this.state.wasClicked) {
                    this.props.onClick(e);
                    this.setState({ wasClicked: false, startedFading: false });
                }
                else {
                    this.setState(
                        { wasClicked: true, startedFading: false },
                        () => {
                            setTimeout(
                                () => {
                                    if (
                                        this.state.wasClicked
                                        && !this.state.startedFading
                                    ) {
                                        this.setState({ startedFading: true })
                                    }
                                },
                                wait
                            );
                            setTimeout(
                                () => {
                                    if (
                                        this.state.wasClicked
                                        || this.state.startedFading
                                    ) {
                                        this.setState({
                                            startedFading: false,
                                            wasClicked: false,
                                        });
                                    }
                                },
                                wait + fade
                            );
                        }
                    );
                }
            }
        }

        return (
            <IconButton
                {...this.props}
                onClick={handleClick}
                sx={{
                    ...this.props.sx,
                    transition: this.state.startedFading
                        ? `color ${fade}ms`
                        : undefined,
                    color: this.state.wasClicked
                        ? (this.state.startedFading
                            ? this.props.defaultColor
                            : this.props.confirmColor ?? theme.palette.error.main
                        )
                        : this.props.defaultColor,
                }}
            >
                {this.props.children}
                <Typography
                    sx={{
                        transition: this.state.startedFading
                            ? `opacity ${fade}ms`
                            : undefined,
                        opacity: this.state.wasClicked
                            ? (this.state.startedFading ? "0%" : "100%")
                            : "0%",
                        color: theme.palette.error.contrastText,
                        fontSize: 10,
                        fontWeight: "bold",
                        marginTop: 0.65,
                        position: 'absolute',
                    }}
                >
                    ?
                </Typography>
            </IconButton>
        );
    }

}
