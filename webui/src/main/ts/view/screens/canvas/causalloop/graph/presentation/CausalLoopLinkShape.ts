import { ConnectorShape, Point, Rectangle } from "@maxgraph/core";
import { Bezier } from "bezier-js";

export default class CausalLoopLinkShape extends ConnectorShape {

    public static readonly CLD_LINK_NAME = "cldLink";

    public getLabelBounds(defaultBounds: Rectangle): Rectangle {
        const bounds = super.getLabelBounds(defaultBounds);
        if (this.points.length < 3 || this.points.includes(null)) {
            return bounds;
        }
        else {
            const middle = this.getMiddlePoint();
            const newBounds = bounds.clone();
            newBounds.x = middle.x
            newBounds.y = middle.y;
            return newBounds;
        }
    }

    private getMiddlePoint(): Point {

        const curves: Bezier[] = this.buildCurvesFromPoints();

        // Iterate through curves until we find the one that contains the
        // halfway point
        const halfwayLen = curves
            .map(b => b.length())
            .reduce((a, b) => a + b)
            / 2;
        var cumLen = 0;
        for (var curve of curves) {
            const nextLen = curve.length();
            if (cumLen + nextLen >= halfwayLen) {
                const remainingLen = halfwayLen - cumLen;
                const distAlongCurve = remainingLen / nextLen;
                // Compute the halfway point, then cast it to a MaxGraph Point
                // object instead of a Bezier-js one
                const pt = curve.compute(distAlongCurve);
                return new Point(pt.x, pt.y);
            }
            else {
                cumLen += nextLen;
            }
        }
        throw new Error("Unable to compute middle point!");
    }

    // Build the composite Bezier curve given the terminal points and control
    // points. Only call if >= 3 points in the curve and none are null.
    private buildCurvesFromPoints(): Bezier[] {
        function extractPoint(p: Point): { x: number, y: number } {
            return { x: p.x, y: p.y };
        }

        const curves: Bezier[] = [];
        var i: number;
        var startPoint, controlPoint, nextPoint, endPoint = undefined;
        for (i = 0; i < this.points.length - 2; i += 2) {
            startPoint = this.points[i]!;
            controlPoint = this.points[i + 1]!;
            nextPoint = this.points[i + 2]!;
            endPoint = new Point(
                (controlPoint.x + nextPoint.x) / 2,
                (controlPoint.y + nextPoint.y) / 2
            );

            curves.push(new Bezier(
                [startPoint, controlPoint, endPoint].map(extractPoint)
            ));
        }

        if (!endPoint) throw new Error("Not enough points for curve");
        curves.push(new Bezier(
            [
                endPoint,
                ...this.points.slice(this.points.length - 2)
                //@ts-ignore points won't be null
            ].map(extractPoint)
        ));
        return curves;
    }

}
