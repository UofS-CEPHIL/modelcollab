import { AbstractCanvas2D, ArrowConnectorShape, Point } from "@maxgraph/core";
import { theme } from "../../../Themes";
import Utils from "../../../Utils";

export default class FlowShape extends ArrowConnectorShape {

    public static readonly FLOW_NAME = "flow";

    public paintEdgeShape(c: AbstractCanvas2D, pts: Point[]): void {
        super.paintEdgeShape(c, pts);
        this.paintValveShape(c, pts);
    }

    private paintValveShape(c: AbstractCanvas2D, pts: Point[]): void {

        const lineTo = (p: Point) => c.lineTo(p.x, p.y);
        const moveTo = (p: Point) => c.moveTo(p.x, p.y);

        const hHeight = theme.custom.maxgraph.flow.valveHeightPx / 2;
        const hWidth = theme.custom.maxgraph.flow.valveWidthPx / 2;
        const middle = Utils.StraightLine.calculateHalfwayPoint(pts);
        const topLeft = new Point(
            middle.x - hWidth,
            middle.y - hHeight
        );
        const bottomRight = new Point(
            middle.x + hWidth,
            middle.y + hHeight
        );
        const bottomLeft = new Point(
            topLeft.x,
            bottomRight.y
        );
        const topRight = new Point(
            bottomRight.x,
            topLeft.y
        );

        c.setStrokeWidth(theme.custom.maxgraph.flow.valveStrokePx);
        c.setFillColor(theme.palette.canvas.main);

        c.begin();

        moveTo(topLeft);
        lineTo(bottomRight);
        lineTo(bottomLeft);
        lineTo(topRight);
        lineTo(topLeft);

        c.fillAndStroke();

        c.close();
        c.end();

        c.setStrokeWidth(this.strokeWidth);
    }

}
