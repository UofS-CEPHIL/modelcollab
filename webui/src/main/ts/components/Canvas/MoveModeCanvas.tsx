import { ReactElement } from "react";
import { Point } from "../DrawingUtils";
import SelectionBox from "../ScreenObjects/SelectionBox";
import { State as CanvasState, Props as CanvasProps, ExtendableBaseCanvas } from "./BaseCanvas";

export interface State extends CanvasState {
    anchorX: number | null,
    anchorY: number | null,
    mouseX: number,
    mouseY: number
}

export default class MoveModeCanvas extends ExtendableBaseCanvas<CanvasProps, State> {

    public constructor(props: CanvasProps) {
        super(props);
        this.state = {
            anchorX: null,
            anchorY: null,
            mouseX: 0,
            mouseY: 0
        };
    }

    protected renderModeSpecificLayer(): ReactElement {
        if (this.state.anchorX && this.state.anchorY)
            return (
                <SelectionBox
                    anchor={{ x: this.state.anchorX, y: this.state.anchorY }}
                    mouse={{ x: this.state.mouseX, y: this.state.mouseY }}
                    selectComponentsInsideBox={(p, q) => this.getComponentIdsInsideBoundingBox(p, q)}
                />
            );
        else
            return super.renderModeSpecificLayer();

    }

    protected onCanvasMouseMoved(x: number, y: number): void {
        this.setState({ ...this.state, mouseX: x, mouseY: y });
    }

    protected onCanvasMouseDown(x: number, y: number): void {
        this.setState({ ...this.state, anchorX: x, anchorY: y });
    }

    protected onCanvasMouseUp(x: number, y: number): void {
        if (this.state.anchorX && this.state.anchorY) {
            this.props.setSelected(
                this.getComponentIdsInsideBoundingBox(
                    { x, y },
                    { x: this.state.anchorX, y: this.state.anchorY }
                )
            );
        }
    }

    private getComponentIdsInsideBoundingBox(p1: Point, p2: Point): string[] {
        return [];
    }
}
