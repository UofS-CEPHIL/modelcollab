import React from 'react';
import { Group, Text } from 'react-konva';

import ComponentUiData, { TextComponent } from "./ComponentUiData";

export interface Props {
    data: TextComponent<any>;
    draggable: boolean;
    updateState: (c: ComponentUiData) => void;
    color: string;
}

export default abstract class TextObject extends React.Component<Props> {
    protected abstract getFontStyle(): string;

    public render() {
        const onDragEnd = (event: any) => {
            const pos = { x: event.target.x(), y: event.target.y() };
            const newComponent = this.props.data.withData(
                { ...this.props.data.getData(), ...pos }
            );
            this.props.updateState(newComponent);
        };
        return (
            <Group
                x={this.props.data.getData().x}
                y={this.props.data.getData().y}
                width={TextComponent.WIDTH}
                height={TextComponent.HEIGHT}
                draggable={this.props.draggable}
                onDragEnd={onDragEnd}
            >
                <Text
                    text={this.props.data.getData().text}
                    width={TextComponent.WIDTH}
                    height={TextComponent.HEIGHT}
                    fontSize={16}
                    verticalAlign={"middle"}
                    align={"center"}
                    name={this.props.data.getId()}
                    fill={this.props.color}
                    fontStyle={this.getFontStyle()}
                />
            </Group>
        );
    }
}
