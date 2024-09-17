import { ListItem, ListItemText, Typography } from '@mui/material';
import React, { ReactElement } from 'react';

export interface Props {
    italic?: boolean;
    bold?: boolean;
    text: string;
    key: any;
}

export default class TypographyListItem extends React.Component<Props> {
    public render(): ReactElement {
        return (
            <ListItem>
                <ListItemText>
                    <Typography
                        variant="h6"
                        fontStyle={this.props.italic ? "italic" : ""}
                        fontWeight={this.props.bold ? "bold" : ""}
                    >
                        {this.props.text}
                    </Typography>
                </ListItemText>
            </ListItem>
        );
    }
}
