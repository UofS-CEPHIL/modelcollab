import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListItem, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import React, { MouseEvent, ReactElement } from "react";
import { Polarity } from "../../../../data/components/FirebaseCausalLoopLink";

export interface Props {
    onChange: (p: Polarity) => void;
    polarity: Polarity;
}

export default class PolarityListItem extends React.Component<Props> {

    public render(): ReactElement {
        return (
            <ListItem>
                <ToggleButtonGroup
                    value={this.props.polarity}
                    exclusive
                    onChange={
                        (_: MouseEvent<HTMLElement>, polarity: Polarity) =>
                            this.props.onChange(polarity)
                    }
                >
                    <Tooltip title="Positive link polarity">
                        <ToggleButton
                            value={Polarity.POSITIVE}
                            aria-label="positive"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                        </ToggleButton>
                    </Tooltip>
                    <Tooltip title="Negative link polarity">
                        <ToggleButton
                            value={Polarity.NEGATIVE}
                            aria-label="negative"
                        >
                            <FontAwesomeIcon icon={faMinus} />
                        </ToggleButton>
                    </Tooltip>
                </ToggleButtonGroup>
            </ListItem>
        );
    }

}
