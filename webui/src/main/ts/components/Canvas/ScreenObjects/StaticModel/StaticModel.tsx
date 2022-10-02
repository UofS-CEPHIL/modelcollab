import React, { ReactElement } from "react";
import { Group, Rect } from "react-konva";
import ComponentCollection from "../../ComponentCollection";
import ComponentRenderer from "../../Renderer/ComponentRenderer";
import ComponentUiData from "../ComponentUiData";
import StaticModelUiData from "./StaticModelUiData";

export interface Props {
    model: StaticModelUiData;
    renderer: ComponentRenderer;
    getColor: (c: ComponentUiData) => string;
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
        return this.props.renderer.render(
            new ComponentCollection(
                this.props.model.getComponentsRelativeToSelf()
            ),
            c => this.props.getColor(c),
            this.props.updateState,
            false,
            false,
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
                key={0}
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
                key={1}
            />
        );
    }

}
