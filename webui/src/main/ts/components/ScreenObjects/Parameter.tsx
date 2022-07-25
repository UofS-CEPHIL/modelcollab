import React from 'react';
import { Group, Rect, Text } from 'react-konva';

import ParameterUiData, { WIDTH, HEIGHT } from "./ParameterUiData";

export interface Props {
    param: ParameterUiData;
    draggable: boolean;
    updateState: (c: ParameterUiData) => void;
    color: string;
}

export default class Parameter extends React.Component<Props> {
    public render() {
        const onDragEnd = (event: any) => {
            const pos = { x: event.target.x(), y: event.target.y() };
            const newComponent = this.props.param.withData(
                { ...this.props.param.getData(), ...pos }
            );
            this.props.updateState(newComponent);
        };
        return (
            <Group
                x={this.props.param.getData().x}
                y={this.props.param.getData().y}
                width={WIDTH}
                height={HEIGHT}
                draggable={this.props.draggable}
                onDragEnd={onDragEnd}
            >
                <Text
                    text={this.props.param.getData().text}
                    width={WIDTH}
                    height={HEIGHT}
                    fontSize={16}
                    verticalAlign={"middle"}
                    align={"center"}
                    name={this.props.param.getId()}
                    fill={this.props.color}
                />
            </Group>
        );
    }
}
