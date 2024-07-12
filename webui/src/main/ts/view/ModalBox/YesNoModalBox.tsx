import { Component, ReactElement } from "react";
import { Typography } from "@mui/material";
import ButtonBox from "./ButtonBox";

export interface Props {
    width?: number;
    prompt: string;
    onYes: () => void;
    onNo: () => void;
}

export default abstract class YesNoModalBox extends Component<Props>
{

    public render(): ReactElement {
        return (
            <ButtonBox
                width={this.props.width}
                buttons={[
                    { label: "Yes", callback: this.props.onYes },
                    { label: "No", callback: this.props.onNo },
                ]}
            >
                <Typography variant="h4" component="div">
                    {this.props.prompt}
                </Typography>
            </ButtonBox>
        );
    }
}
