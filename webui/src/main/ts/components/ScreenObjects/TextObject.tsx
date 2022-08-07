import React, { ReactElement, Ref, useRef } from 'react';
import Konva, { Group, Text } from 'react-konva';

import ComponentUiData, { TextComponent } from "./ComponentUiData";

export interface Props {
    data: TextComponent<any>;
    draggable: boolean;
    updateState: (c: ComponentUiData) => void;
    color: string;
}

export default abstract class TextObject extends React.Component<Props> {

    protected abstract getFontStyle(): string;

    public static FONT_SIZE = 16;

    public render() {
        const onDragEnd = (event: any) => {
            const pos = { x: event.target.x(), y: event.target.y() };
            const newComponent = this.props.data.withData(
                { ...this.props.data.getData(), ...pos }
            );
            this.props.updateState(newComponent);
        };

        const textComponent: any = (
            <Text
                x={this.props.data.getData().x}
                y={this.props.data.getData().y}
                text={this.props.data.getData().text}
                fontSize={TextObject.FONT_SIZE}
                verticalAlign={"middle"}
                align={"center"}
                name={this.props.data.getId()}
                fill={this.props.color}
                fontStyle={this.getFontStyle()}
                draggable={this.props.draggable}
                onDragEnd={onDragEnd}
            />
        );
        return textComponent;
    }
}
