import React, { ReactElement } from "react";
import { Group, Rect } from "react-konva";
import { Point } from "../DrawingUtils";

export interface Props {
    anchor: Point;
    mouse: Point;
    selectComponentsInsideBox: (anchor: Point, mouse: Point) => void;
}

export default class SelectionBox extends React.Component<Props> {

    public static readonly BORDER_COLOUR = "blue";

    public render(): ReactElement {
        const topLeftCorner = {
            x: Math.min(this.props.anchor.x, this.props.mouse.x),
            y: Math.min(this.props.anchor.y, this.props.mouse.y)
        };
        const bottomRightCorner = {
            x: Math.max(this.props.anchor.x, this.props.mouse.x),
            y: Math.max(this.props.anchor.y, this.props.mouse.y)
        };

        return (
            <Group>
                {this.makeInnerRect(topLeftCorner, bottomRightCorner)}
                {this.makeOuterRect(topLeftCorner, bottomRightCorner)}
            </Group>
        );
    }

    private makeInnerRect(topLeftCorner: Point, bottomRightCorner: Point): ReactElement {
        return (
            <Rect
                stroke={SelectionBox.BORDER_COLOUR}
                fill={SelectionBox.BORDER_COLOUR}
                fillEnabled={true}
                opacity={0.15}

                {...topLeftCorner}
                width={bottomRightCorner.x - topLeftCorner.x}
                height={bottomRightCorner.y - topLeftCorner.y}
            />
        );
    }

    private makeOuterRect(topLeftCorner: Point, bottomRightCorner: Point): ReactElement {
        return (
            <Rect
                stroke={SelectionBox.BORDER_COLOUR}
                strokeWidth={2}
                strokeEnabled={true}

                {...topLeftCorner}
                width={bottomRightCorner.x - topLeftCorner.x}
                height={bottomRightCorner.y - topLeftCorner.y}
            />
        );
    }
}
