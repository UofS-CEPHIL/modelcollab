import React, { ReactElement } from "react";
import { Rect } from "react-konva";
import { Point } from "../DrawingUtils";

export interface Props {
    anchor: Point;
    mouse: Point;
    selectComponentsInsideBox: (anchor: Point, mouse: Point) => void;
}

export default class SelectionBox extends React.Component<Props> {

    public static readonly BORDER_COLOUR = "blue";

    public render(): ReactElement {
        return (
            <Rect
                stroke={SelectionBox.BORDER_COLOUR}
                strokeWidth={2}
                strokeEnabled={true}
                fill={SelectionBox.BORDER_COLOUR}
                opacity={0.2}
            />
        );
    }
}
