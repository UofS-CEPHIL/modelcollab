import { AbstractCanvas2D, ColorValue, Rectangle, Shape } from "@maxgraph/core";
import { theme } from "../../../Themes";

export default class LoopIconShape extends Shape {

    public constructor(
        bounds: Rectangle,
        stroke: ColorValue,
        strokeWidth: number = 1
    ) {
        super();
        this.bounds = bounds;
        this.stroke = stroke;
        this.strokeWidth = strokeWidth;
    }

    public paintVertexShape(
        c: AbstractCanvas2D,
        x: number,
        y: number,
        width: number,
        height: number
    ) {
        const radius = width / 2;
        const startx = x;
        const starty = y + radius;
        const endx = x + radius;
        const endy = y;
        const arrowWidth = theme.custom.maxgraph.loopIcon.arrowHeadWidth;
        const arrowHeight = theme.custom.maxgraph.loopIcon.arrowHeadHeight;
        const arrowColor = this.stroke;

        // Draw the line
        c.begin();
        c.moveTo(startx, starty);
        c.arcTo(radius, radius, 270, true, false, endx, endy);
        c.stroke();

        // Draw the arrow head
        c.begin();
        c.setFillColor(arrowColor);
        c.moveTo(startx, starty);
        c.lineTo(startx - (arrowWidth / 2), starty);
        c.lineTo(startx, starty - arrowHeight);
        c.lineTo(startx + (arrowWidth / 2), starty);
        c.lineTo(startx, starty);
        c.fillAndStroke();

    }
}
