import React, { ReactElement } from 'react';
import { Arrow, Group, Line, Rect, Text } from "react-konva";
import { Point } from '../../../DrawingUtils';
import ComponentUiData from '../ComponentUiData';

import FlowUiData from "./FlowUiData";


export interface Props {
    flowData: FlowUiData;
    components: ComponentUiData[];
    color: string;
};

export default class Flow extends React.Component<Props> {

    render(): ReactElement {
        const arrowPoints = this.props.flowData.getAngleArrowPoints(this.props.components);
        const textLocation = this.props.flowData.computeLabelPosition(arrowPoints);
        return (
            <Group>
                {
                    this.makeArrow(arrowPoints)
                }
                {
                    this.makeLabel(textLocation)
                }
            </Group>
        );
    }

    private makeArrow(points: number[]): ReactElement {
        const ARROW_HEAD_SIZE_PX = 20;
        const INNER_STROKE_WIDTH = 4;
        const OUTER_STROKE_WIDTH = 3;
        const STROKE_SIZE = INNER_STROKE_WIDTH + (2 * OUTER_STROKE_WIDTH);
        const [x1, y1, x2, y2, x3, y3] = points;
        const lineAngleRads = Math.atan2(y3 - y2, x3 - x2);
        const dx = Math.cos(lineAngleRads);
        const dy = Math.sin(lineAngleRads);
        // Black arrow with a white line to give it the 'double lined' look
        // Inner line -= (dx, dy) so it doesn't cover the arrow head
        return (
            <Group>
                <Arrow
                    points={[
                        x1,
                        y1,
                        x2,
                        y2,
                        x3 - (dx * STROKE_SIZE),
                        y3 - (dy * STROKE_SIZE)
                    ]}
                    stroke={this.props.color}
                    strokeWidth={STROKE_SIZE}
                    pointerLength={ARROW_HEAD_SIZE_PX}
                    pointerWidth={ARROW_HEAD_SIZE_PX}
                    name={this.props.flowData.getId()}
                />
                <Line
                    points={[
                        x1,
                        y1,
                        x2,
                        y2,
                        x3 - (dx * (ARROW_HEAD_SIZE_PX + STROKE_SIZE + INNER_STROKE_WIDTH)),
                        y3 - (dy * (ARROW_HEAD_SIZE_PX + STROKE_SIZE + INNER_STROKE_WIDTH))
                    ]}
                    stroke={"white"}
                    strokeWidth={INNER_STROKE_WIDTH}
                    name={this.props.flowData.getId()}
                />
            </Group>
        );
    }

    private makeLabel(position: Point): ReactElement {
        const height = this.props.flowData.computeLabelHeight();
        const width = this.props.flowData.computeLabelWidth();
        return (
            <Group
                x={position.x}
                y={position.y}
                name={this.props.flowData.getId()}
                width={width}
                height={height}
            >
                <Rect
                    fillEnabled={true}
                    fill={"white"}
                    stroke={this.props.color}
                    strokeWidth={1}
                    name={this.props.flowData.getId()}
                    width={width}
                    height={height}
                />
                <Text
                    width={width}
                    height={height}
                    text={this.props.flowData.getData().text}
                    verticalAlign={"middle"}
                    align={"center"}
                    name={this.props.flowData.getId()}
                />
            </Group>
        );
    }
}
