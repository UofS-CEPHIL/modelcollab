import React, { ReactElement } from 'react';
import { Rect, Text, Group } from "react-konva";

import StockUiData from './StockUiData';

export const WIDTH_PX = 100;
export const HEIGHT_PX = 70;
export const DEFAULT_COLOR = "black";
export const SELECTED_COLOR = "red";

export interface Props {
    stock: StockUiData;
    text: string;
    color: string;
    draggable: boolean;
    updateState: (s: StockUiData) => void;
}

export default class Stock extends React.Component<Props> {
    public render(): ReactElement {
        const onDragEnd = (event: any) => {
            const pos = { x: event.target.x(), y: event.target.y() };
            const newComponent = this.props.stock.withData(
                { ...this.props.stock.getData(), ...pos }
            );
            this.props.updateState(newComponent);
        };
        return (
            <Group
                draggable={this.props.draggable}
                onDragEnd={onDragEnd}
                width={WIDTH_PX}
                height={HEIGHT_PX}
                x={this.props.stock.getData().x}
                y={this.props.stock.getData().y}
                name={this.props.stock.getId()}
            >
                <Rect
                    fillEnabled={true}
                    fill={"white"}
                    width={WIDTH_PX}
                    height={HEIGHT_PX}
                    stroke={this.props.color}
                    strokeWidth={3}
                    name={this.props.stock.getId()}
                />
                <Text
                    width={WIDTH_PX}
                    height={HEIGHT_PX}
                    text={this.props.stock.getData().text}
                    verticalAlign={"middle"}
                    align={"center"}
                    name={this.props.stock.getId()}
                />
            </Group>
        );
    }
}
