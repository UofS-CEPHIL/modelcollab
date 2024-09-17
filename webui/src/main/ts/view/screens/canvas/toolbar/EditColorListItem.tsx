import { Button, Grid, ListItem, Menu, Box } from '@mui/material';
import { faFill } from "@fortawesome/free-solid-svg-icons";
import React, { Fragment, MouseEvent, ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface Props {
    color: string;
    onChange: (color: string) => void;
}

export interface State {
    anchorElement: HTMLElement | null;
}

const COLORS = [
    { light: "#FFFFFF", dark: "#000000" },
    { light: "#ECEFF1", dark: "#263238" },
    { light: "#EFEBE9", dark: "#3E2723" },
    { light: "#FBE9E7", dark: "#BF360C" },
    { light: "#FFF3E0", dark: "#E65100" },
    { light: "#FFF8E1", dark: "#FF6F00" },
    { light: "#FFFDE7", dark: "#F57F17" },
    { light: "#F9FBE7", dark: "#827717" },
    { light: "#F1F8E9", dark: "#33691E" },
    { light: "#E8F5E9", dark: "#1B5E20" },
    { light: "#E0F2F1", dark: "#004D40" },
    { light: "#E0F7FA", dark: "#006064" },
    { light: "#E1F5FE", dark: "#01579B" },
    { light: "#E3F2FD", dark: "#0D47A1" },
    { light: "#E8EAF6", dark: "#1A237E" },
    { light: "#EDE7F6", dark: "#311B92" },
    { light: "#F3E5F5", dark: "#4A148C" },
    { light: "#FCE4EC", dark: "#880E4F" },
    { light: "#FFEBEE", dark: "#B71C1C" },
];

export default class EditColorListItem extends React.Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { anchorElement: null };
    }

    public render(): ReactElement {
        return (
            <ListItem key="editcolorlistitem">
                {this.makeDropdown()}
            </ListItem>
        );
    }

    public makeDropdown(): ReactElement {
        const handleClose = () => {
            this.setState({ anchorElement: null });
        }

        const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
            this.setState({ anchorElement: e.currentTarget });
        }

        return (
            <Fragment>
                <Button
                    variant="outlined"
                    onClick={handleClick}
                    key="fontcolorbutton"
                >
                    <FontAwesomeIcon color={this.props.color} icon={faFill} />
                </Button>
                <Menu
                    open={this.state.anchorElement !== null}
                    anchorEl={this.state.anchorElement}
                    onClose={handleClose}
                    key="colormenu"
                >
                    {this.makeColorGrid()}
                </Menu>
            </Fragment>
        );
    }

    private hexToRgb(hex: string): { r: number, g: number, b: number } {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        };
    }

    private rgbToHex(r: number, g: number, b: number): string {
        function makeNum(n: number): string {
            var s = Math.floor(n).toString(16);
            if (s.length === 1) s = "0" + s;
            return s;
        }
        return "#" + makeNum(r) + makeNum(g) + makeNum(b);
    }

    public makeColorGrid(): ReactElement {
        const itemWidth = 15;
        const numShades = 10;
        const spacing = 0;

        const makeColors = (dark: string, light: string) => {
            const colors: string[] = [];
            const d = this.hexToRgb(dark);
            const l = this.hexToRgb(light);
            const diffR = Math.abs(d.r - l.r);
            const diffG = Math.abs(d.g - l.g);
            const diffB = Math.abs(d.b - l.b);
            for (var i = 0; i <= numShades; i++) {
                colors.push(this.rgbToHex(
                    d.r + (i * diffR / numShades),
                    d.g + (i * diffG / numShades),
                    d.b + (i * diffB / numShades)
                ));
            }
            return colors;
        }

        const makeItem = (color: string) => (
            <Grid item xs={1} key={color}>
                <Box
                    onClick={() => this.props.onChange(color)}
                    sx={{
                        outline: 1,
                        outlineColor: "#000000",
                        backgroundColor: color,
                        width: itemWidth,
                        height: itemWidth,
                        cursor: "pointer",
                    }}
                />
            </Grid>
        )

        return (
            <Grid
                container
                direction="row"
                columns={COLORS.length}
                wrap="nowrap"
                key="colorgrid"
            >
                {COLORS.map((c, i) =>
                    <Grid
                        item
                        container
                        direction="column"
                        spacing={spacing}
                        xs={1}
                        key={"colorcol" + i}
                    >
                        {makeColors(c.dark, c.light).map(makeItem)}
                    </Grid>
                )}
            </Grid>
        );
    }

}
