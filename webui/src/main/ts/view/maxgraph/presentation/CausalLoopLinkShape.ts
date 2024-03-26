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
            newBounds.x = middle.x - (bounds.width / 2);
            newBounds.y = middle.y - (bounds.height / 2);
            return newBounds;
        }
    }

    private getMiddlePoint(): Point {
        // TODO this is slightly inaccurate when >3 control points
        const curves: Bezier[] = [];
        // Sliding window looking at 3 items at a time
        // Make a curve for each
        var i: number;
        for (i = 0; i < this.points.length - 2; i += 2) {
            curves.push(new Bezier(
                // @ts-ignore points doesn't contain null -- checked above
                this.points.slice(i, i + 3)
            ));
        }

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

}
