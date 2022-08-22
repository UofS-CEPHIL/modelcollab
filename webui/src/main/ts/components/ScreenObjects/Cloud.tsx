import React from 'react';
import { Star } from 'react-konva';

import CloudUiData from "./CloudUiData";

export interface Props {
    data: CloudUiData;
    color: string;
    updateState: (c: CloudUiData) => void;
}

export default class Cloud extends React.Component<Props> {

    public render() {
        const onDragEnd = (event: any) => {
            const pos = { x: event.target.x(), y: event.target.y() };
            const newComponent = this.props.data.withData(
                { ...this.props.data.getData(), ...pos }
            );
            this.props.updateState(newComponent);
        };
        return (
            <Star
                x={this.props.data.getData().x}
                y={this.props.data.getData().y}
                name={this.props.data.getId()}
                numPoints={30}
                innerRadius={CloudUiData.RADIUS - 5}
                outerRadius={CloudUiData.RADIUS}
                fill={"white"}
                stroke={this.props.color}
                lineJoin={"round"}
                strokeWidth={2}
                draggable
                onDragEnd={onDragEnd}
            />
        );
    }
}
