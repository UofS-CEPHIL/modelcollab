import React, { ReactElement } from "react";
import { Group, Rect } from "react-konva";
import ComponentCollection from "../Canvas/ComponentCollection";
import ComponentRenderer from "../Canvas/ComponentRenderer";
import ComponentUiData from "./ComponentUiData";
import StaticModelUiData from "./StaticModelUiData";

export interface Props {
    model: StaticModelUiData;
    renderer: ComponentRenderer;
    draggable: boolean;
    updateState: (c: ComponentUiData) => void;
}

export default class StaticModel extends React.Component<Props> {

    private onDragEnd(event: any): void {
        const pos = { x: event.target.x(), y: event.target.y() };
        const newComponent = this.props.model.withData(
            { ...this.props.model.getData(), ...pos }
        );
        this.props.updateState(newComponent);
    };

    public render(): ReactElement {
        return (
            <Group
                x={this.props.model.getData().x}
                y={this.props.model.getData().y}
                draggable={this.props.draggable}
                onDragEnd={e => this.onDragEnd(e)}
                name={this.props.model.getId()}
            >
                {this.makeInnerRect()}
                {this.makeOuterRect()}
                {this.makeComponents()}
            </Group>
        );
    }

    private makeComponents(): ReactElement[] {
        const minX = Math.min(...this.props.model
            .getComponents()
            .filter(c => c.getData().x !== undefined)
            .map(c => c.getData().x as number)) - StaticModelUiData.PAD_PX;
        const minY = Math.min(...this.props.model
            .getComponents()
            .filter(c => c.getData().y !== undefined)
            .map(c => c.getData().y as number)) - StaticModelUiData.PAD_PX;
        return this.props.renderer.render(
            new ComponentCollection(
                this.props.model.getComponents()
            ),
            _ => "black",
            this.props.updateState,
            false,
            false,
            minX,
            minY
        )
    }

    private makeInnerRect(): ReactElement {
        return (
            <Rect
                width={this.props.model.getWidthPx()}
                height={this.props.model.getHeightPx()}
                fill={this.props.model.getData().color}
                opacity={0.3}
                lineJoin={"round"}
                draggable={false}
                name={this.props.model.getId()}
            />
        );
    }

    private makeOuterRect(): ReactElement {
        return (
            <Rect
                width={this.props.model.getWidthPx()}
                height={this.props.model.getHeightPx()}
                stroke={this.props.model.getData().color}
                strokeWidth={3}
                lineJoin={"round"}
                draggable={false}
                name={this.props.model.getId()}
            />
        );
    }

}
