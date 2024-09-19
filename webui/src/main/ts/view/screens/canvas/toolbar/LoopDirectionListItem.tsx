import { faArrowRotateLeft, faArrowRotateRight, faDownLong, faUpLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, ListItem, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import React, { MouseEvent, ReactElement } from 'react';

export interface Props {
    up: boolean;
    clockwise: boolean;
    onChange: (up: boolean, clockwise: boolean) => void;
}

export default class LoopDirectionListItem extends React.Component<Props> {

    public render(): ReactElement {
        return (
            <ListItem>
                <Grid container direction="row" spacing={1}>
                    <Grid item>
                        <ToggleButtonGroup
                            value={this.props.up}
                            exclusive
                            onChange={
                                (_: MouseEvent<HTMLElement>, up: boolean) =>
                                    this.props.onChange(up, this.props.clockwise)
                            }
                            aria-label="Up or Down Selection"
                        >
                            <Tooltip title="Arrow Points Up">
                                <ToggleButton
                                    value={true}
                                    aria-label="Up"
                                >
                                    <FontAwesomeIcon icon={faUpLong} />
                                </ToggleButton>
                            </Tooltip>
                            <Tooltip title="Arrow Points Down">
                                <ToggleButton
                                    value={false}
                                    aria-label="Down"
                                >
                                    <FontAwesomeIcon icon={faDownLong} />
                                </ToggleButton>
                            </Tooltip>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item>
                        <ToggleButtonGroup
                            value={this.props.clockwise}
                            exclusive
                            onChange={
                                (
                                    _: MouseEvent<HTMLElement>,
                                    clockwise: boolean
                                ) => this.props.onChange(
                                    this.props.up,
                                    clockwise
                                )
                            }
                            aria-label="Clockwise or Counterclockwise Selection"
                        >
                            <Tooltip title="Loop Runs Clockwise">
                                <ToggleButton
                                    value={true}
                                    aria-label="Clockwise"
                                >
                                    <FontAwesomeIcon icon={faArrowRotateRight} />
                                </ToggleButton>
                            </Tooltip>
                            <Tooltip title="Loop Runs Counter-Clockwise">
                                <ToggleButton
                                    value={false}
                                    aria-label="Counterclockwise"
                                >
                                    <FontAwesomeIcon icon={faArrowRotateLeft} />
                                </ToggleButton>
                            </Tooltip>
                        </ToggleButtonGroup>
                    </Grid>
                </Grid>
            </ListItem>
        );
    }

}
