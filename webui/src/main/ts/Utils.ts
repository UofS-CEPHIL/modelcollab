import { Point } from "@maxgraph/core";

class StraightLineUtils {

    public static calculateHalfwayPoint(pts: Point[]): Point {

        if (pts.length < 2)
            throw new Error(`List of size ${pts.length} is too small`);

        const totalDistance = this.calculateTotalDistance(pts);
        const middleDistance = totalDistance / 2;

        let currentDistance = 0;
        for (let i = 1; i < pts.length; i++) {
            const segmentDistance = this.calculateDistance(pts[i - 1], pts[i]);
            const nextDistance = currentDistance + segmentDistance;
            if (currentDistance + segmentDistance >= middleDistance) {
                const remainingDistance = middleDistance - currentDistance;
                const ratio = segmentDistance === 0
                    ? 0
                    : remainingDistance / segmentDistance;
                const x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) * ratio;
                const y = pts[i - 1].y + (pts[i].y - pts[i - 1].y) * ratio;
                return new Point(x, y);
            }
            currentDistance = nextDistance;
        }
        throw new Error();
    }

    public static calculateTotalDistance(pts: Point[]): number {
        let totalDistance = 0;
        for (let i = 1; i < pts.length; i++) {
            totalDistance += this.calculateDistance(pts[i - 1], pts[i]);
        }
        return totalDistance;
    }

    public static calculateDistance(p1: Point, p2: Point): number {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

export default class Utils {

    public static readonly StraightLine = StraightLineUtils;

}
