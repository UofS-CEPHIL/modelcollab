import { ReactElement } from "react";
import { Point } from "../../DrawingUtils";
import SelectionBox from "../ScreenObjects/SelectionBox";
import { State as CanvasState, Props as CanvasProps, ExtendableBaseCanvas } from "../BaseCanvas";

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
            mouseY: 0,
        };
    }

    private isDraggingSelectionBox(): boolean {
        return this.state.anchorX !== null && this.state.anchorY !== null;
    }

    protected renderModeSpecificLayer(): ReactElement {
        if (this.isDraggingSelectionBox())
            return (
                <SelectionBox
                    anchor={{ x: this.state.anchorX || 0, y: this.state.anchorY || 0 }}
                    mouse={{ x: this.state.mouseX, y: this.state.mouseY }}
                    selectComponentsInsideBox={(p, q) => this.getComponentIdsInsideBoundingBox(p, q)}
                />
            );
        else
            return super.renderModeSpecificLayer();
    }

    protected onCanvasMouseMoved(x: number, y: number): void {
        if (this.state.anchorX && this.state.anchorY)
            this.setState({ ...this.state, mouseX: x, mouseY: y });
    }

    protected onCanvasMouseDown(x: number, y: number): void {
        this.setState({ ...this.state, anchorX: x, anchorY: y, mouseX: x, mouseY: y });
    }

    protected onCanvasMouseUp(x: number, y: number): void {
        if (this.state.anchorX && this.state.anchorY) {
            const topLeftCorner = {
                x: Math.min(this.state.anchorX, x),
                y: Math.min(this.state.anchorY, y)
            };
            const bottomRightCorner = {
                x: Math.max(this.state.anchorX, x),
                y: Math.max(this.state.anchorY, y)
            };
            this.props.setSelected(
                this.getComponentIdsInsideBoundingBox(topLeftCorner, bottomRightCorner)
            );
            this.setState({ ...this.state, anchorX: null, anchorY: null, mouseX: 0, mouseY: 0 });
        }
    }

    private getComponentIdsInsideBoundingBox(topLeft: Point, bottomRight: Point): string[] {
        return this.props.components.getAllComponents()
            .filter(c =>
                c.isInsideBoundingBox(
                    topLeft,
                    bottomRight,
                    this.props.components.getAllComponents()
                )
            ).map(c => c.getId());
    }
}
