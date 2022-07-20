import { Point } from "../components/ScreenObjects/Flow"

import { HEIGHT_PX, WIDTH_PX } from '../components/ScreenObjects/Stock';

//source: https://www.productboard.com/blog/how-we-implemented-svg-arrows-in-react-the-curvature-2-3/
export class ArrowUtils {

    linearEquation(coefficient: number, x: number, constant: number = 0) {
        return Math.abs((coefficient * x + constant))
    }

    calculateDeltas = (startPoint: Point, endPoint: Point): { dx: number, dy: number, absDx: number, absDy: number } => {

        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        return { dx, dy, absDx, absDy };
    }

    calculateControlPoints = (absDx: number, absDy: number, dx: number, dy: number): { p1: Point, p4: Point } => {
        let startPointX = 0;
        let startPointY = 0;
        let endPointX = absDx;
        let endPointY = absDy;

        if (dx < 0) [startPointX, endPointX] = [endPointX, startPointX];
        if (dy < 0) [startPointY, endPointY] = [endPointY, startPointY];


        const p1 = {
            x: startPointX,
            y: startPointY,
        };

        //p2 and p3 are used for Cubic Bezier curve
        // const p2 = {
        //   x: startPointX + fixedLineInflectionConstant,
        //   y: startPointY,
        // };
        // const p3 = {
        //   x: endPointX - fixedLineInflectionConstant,
        //   y: endPointY,
        // };

        const p4 = {
            x: endPointX,
            y: endPointY,
        };
        return { p1, p4 };
    };

    calculateControlPointsWithBuffer = (boundingBoxElementsBuffer: number, absDx: number, absDy: number, dx: number, dy: number): {
        p1: Point;
        p4: Point;
        boundingBoxBuffer: {
            vertical: number;
            horizontal: number;
        };
    } => {
        const { p1, p4 } = this.calculateControlPoints(absDx, absDy, dx, dy,);

        const topBorder = Math.min(p1.y, p4.y);
        const bottomBorder = Math.max(p1.y, p4.y);
        const leftBorder = Math.min(p1.x, p4.x);
        const rightBorder = Math.max(p1.x, p4.x);

        const verticalBuffer = (bottomBorder - topBorder - absDy) / 2 + boundingBoxElementsBuffer;
        const horizontalBuffer = (rightBorder - leftBorder - absDx) / 2 + boundingBoxElementsBuffer;

        const boundingBoxBuffer = {
            vertical: verticalBuffer,
            horizontal: horizontalBuffer,
        };

        return {
            p1: {
                x: p1.x + horizontalBuffer,
                y: p1.y + verticalBuffer,
            },
            p4: {
                x: p4.x + horizontalBuffer,
                y: p4.y + verticalBuffer,
            },
            boundingBoxBuffer,
        };
    };

    calculateCanvasDimensions = (absDx: number, absDy: number, boundingBoxBuffer: { vertical: number; horizontal: number }): {
        canvasWidth: number;
        canvasHeight: number;
    } => {
        const canvasWidth = absDx + 2 * boundingBoxBuffer.horizontal;
        const canvasHeight = absDy + 2 * boundingBoxBuffer.vertical;

        return { canvasWidth, canvasHeight };
    };

    calculatePartialArrowComponent = (startPoint: Point, endPoint: Point, boundingBoxElementBuffer: number): {
        p2: Point, p4: Point, partialCanvasWidth: number, partialCanvasHeight: number,
        partialCanvasXOffset: number, partialCanvasYOffset: number,
        partialDy: number, partialDx: number
    } => {

        const { dy, dx, absDy, absDx } = this.calculateDeltas(startPoint, endPoint);
        const { p1, p4, boundingBoxBuffer } = this.calculateControlPointsWithBuffer(boundingBoxElementBuffer, absDx, absDy, dx, dy)
        const { canvasWidth, canvasHeight } = this.calculateCanvasDimensions(absDx, absDy, boundingBoxBuffer);

        const partialCanvasXOffset = Math.min(startPoint.x, endPoint.x) - boundingBoxBuffer.horizontal;
        const partialCanvasYOffset = Math.min(startPoint.y, endPoint.y) - boundingBoxBuffer.vertical;
        const p2: Point = p1;

        const partialCanvasWidth = canvasWidth;
        const partialCanvasHeight = canvasHeight;

        const partialDy = dy;
        const partialDx = dx;

        return { p2, p4, partialCanvasWidth, partialCanvasHeight, partialCanvasXOffset, partialCanvasYOffset, partialDy, partialDx }
    }

    calculateArrowComponent = (startPoint: Point, endPoint: Point, boundingBoxElementBuffer: number): { p1: Point, p2: Point, p4: Point, canvasWidth: number, canvasHeight: number, canvasXOffset: number, canvasYOffset: number, dy: number, dx: number, labelInfo: labelParameters } => {

        let localEndPoint: Point;
        const startCenterPoint: Point = { x: startPoint.x + (WIDTH_PX / 2), y: startPoint.y + (HEIGHT_PX / 2) }
        let localMiddlePoint: Point;
        let renderCase: string = "H";

        if (startCenterPoint.x >= endPoint.x && startCenterPoint.x <= (endPoint.x + WIDTH_PX) && startCenterPoint.y < endPoint.y) {
            localEndPoint = { x: endPoint.x + (WIDTH_PX / 2), y: endPoint.y - boundingBoxElementBuffer }
            localMiddlePoint = { x: endPoint.x + (WIDTH_PX / 2), y: startCenterPoint.y }
            renderCase = "V"
        }

        else if (startCenterPoint.x >= endPoint.x && startCenterPoint.x <= (endPoint.x + WIDTH_PX) && startCenterPoint.y > (endPoint.y + HEIGHT_PX)) {
            localEndPoint = { x: endPoint.x + (WIDTH_PX / 2), y: endPoint.y + (HEIGHT_PX) + boundingBoxElementBuffer + 15 }
            localMiddlePoint = { x: endPoint.x + (WIDTH_PX / 2), y: startCenterPoint.y }
            renderCase = "V"
        }

        else if (startCenterPoint.y >= endPoint.y && startCenterPoint.y <= endPoint.y + HEIGHT_PX && startCenterPoint.x < endPoint.x) {
            localEndPoint = { x: endPoint.x - boundingBoxElementBuffer, y: endPoint.y + (HEIGHT_PX / 2) }
            localMiddlePoint = { x: startCenterPoint.x, y: endPoint.y + (HEIGHT_PX / 2) }
            renderCase = "H"
        }

        else if (startCenterPoint.y >= endPoint.y && startCenterPoint.y <= endPoint.y + HEIGHT_PX && startCenterPoint.x > endPoint.x) {
            localEndPoint = { x: endPoint.x + WIDTH_PX + boundingBoxElementBuffer, y: endPoint.y + (HEIGHT_PX / 2) }
            localMiddlePoint = { x: startCenterPoint.x, y: endPoint.y + (HEIGHT_PX / 2) }
            renderCase = "H"
        }

        //special cases

        //top right corner
        else if (startCenterPoint.x > endPoint.x && startCenterPoint.y < endPoint.y) {
            if (startCenterPoint.x - (endPoint.x + WIDTH_PX) < endPoint.y - startCenterPoint.y) {
                localEndPoint = { x: endPoint.x + (WIDTH_PX / 2), y: endPoint.y - boundingBoxElementBuffer }
                localMiddlePoint = { x: endPoint.x + (WIDTH_PX / 2), y: startCenterPoint.y }
                renderCase = "V"
            }
            else {
                localEndPoint = { x: endPoint.x + WIDTH_PX + boundingBoxElementBuffer, y: endPoint.y + (HEIGHT_PX / 2) }
                localMiddlePoint = { x: startCenterPoint.x, y: endPoint.y + (HEIGHT_PX / 2) }
                renderCase = "H"

            }
        }

        //bottom right corner
        else if (startCenterPoint.x > endPoint.x && startCenterPoint.y > endPoint.y) {

            if (startCenterPoint.x - (endPoint.x + WIDTH_PX) < startCenterPoint.y - (endPoint.y + HEIGHT_PX)) {
                localEndPoint = { x: endPoint.x + (WIDTH_PX / 2), y: endPoint.y + (HEIGHT_PX) + boundingBoxElementBuffer + 15 }
                localMiddlePoint = { x: endPoint.x + (WIDTH_PX / 2), y: startCenterPoint.y }
                renderCase = "V"

            }
            else {
                localEndPoint = { x: endPoint.x + WIDTH_PX + boundingBoxElementBuffer, y: endPoint.y + (HEIGHT_PX / 2) }
                localMiddlePoint = { x: startCenterPoint.x, y: endPoint.y + (HEIGHT_PX / 2) }
                renderCase = "H"
            }
        }

        //bottom left corner
        else if (startCenterPoint.x < endPoint.x && startCenterPoint.y > endPoint.y) {
            if (endPoint.x - startCenterPoint.x < startCenterPoint.y - (endPoint.y + HEIGHT_PX)) {
                localEndPoint = { x: endPoint.x + (WIDTH_PX / 2), y: endPoint.y + (HEIGHT_PX) + boundingBoxElementBuffer + 15 }
                localMiddlePoint = { x: endPoint.x + (WIDTH_PX / 2), y: startCenterPoint.y }
                renderCase = "V";
            }
            else {
                localEndPoint = { x: endPoint.x - boundingBoxElementBuffer, y: endPoint.y + (HEIGHT_PX / 2) }
                localMiddlePoint = { x: startCenterPoint.x, y: endPoint.y + (HEIGHT_PX / 2) }
                renderCase = "H";
            }
        }

        //top left corner
        else {
            if (endPoint.x - startCenterPoint.x < endPoint.y - startCenterPoint.y) {
                localEndPoint = { x: endPoint.x + (WIDTH_PX / 2), y: endPoint.y - boundingBoxElementBuffer }
                localMiddlePoint = { x: endPoint.x + (WIDTH_PX / 2), y: startCenterPoint.y }
                renderCase = "V"

            }
            else {
                localEndPoint = { x: endPoint.x - boundingBoxElementBuffer, y: endPoint.y + (HEIGHT_PX / 2) }
                localMiddlePoint = { x: startCenterPoint.x, y: endPoint.y + (HEIGHT_PX / 2) }
                renderCase = "H"
            }
        }

        const { p2, partialCanvasHeight,
            partialCanvasWidth,
            partialCanvasXOffset,
            partialCanvasYOffset, partialDx, partialDy } = this.calculatePartialArrowComponent(localMiddlePoint, localEndPoint, boundingBoxElementBuffer)

        let { dy, dx, absDy, absDx } = this.calculateDeltas(startCenterPoint, localEndPoint);
        let { p1, p4, boundingBoxBuffer } = this.calculateControlPointsWithBuffer(boundingBoxElementBuffer, absDx, absDy, dx, dy)
        switch (renderCase) {
            case ("V"):
                p2.x = p4.x
                break
            case ("H"):
                p2.y = p4.y
        }

        const labelInfo = new labelParameters(partialDy, partialDx, partialCanvasWidth, partialCanvasHeight, partialCanvasXOffset, partialCanvasYOffset)
        const { canvasWidth, canvasHeight } = this.calculateCanvasDimensions(absDx, absDy, boundingBoxBuffer);

        const canvasXOffset = Math.min(startCenterPoint.x, localEndPoint.x) - boundingBoxBuffer.horizontal;
        const canvasYOffset = Math.min(startCenterPoint.y, localEndPoint.y) - boundingBoxBuffer.vertical;

        return { p1, p2, p4, canvasWidth, canvasHeight, canvasXOffset, canvasYOffset, dy, dx, labelInfo }
    }

}

class labelParameters {
    public dy: number;
    public dx: number;
    public width: number;
    public height: number;
    public xOffset: number;
    public yOffset: number;

    constructor(dy: number, dx: number, width: number, height: number, xOffset: number, yOffset: number) {
        this.dy = dy;
        this.dx = dx;
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
    }
}
