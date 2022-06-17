import {Point} from "../components/Canvas/Flow"

//source: https://www.productboard.com/blog/how-we-implemented-svg-arrows-in-react-the-curvature-2-3/
export class ArrowUtils {
    calculateDeltas = (startPoint: Point, endPoint: Point): {dx: number, dy: number, absDx: number, absDy: number,} => {
       
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
    
        return {dx,dy,absDx,absDy};
    }
  
    calculateControlPoints = (absDx : number, absDy: number, dx: number, dy: number) : {p1: Point, p4: Point} => {
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
  
    calculateControlPointsWithBuffer = ( boundingBoxElementsBuffer: number, absDx: number, absDy: number, dx: number, dy: number): {
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
        const horizontalBuffer =(rightBorder - leftBorder - absDx) / 2 + boundingBoxElementsBuffer;
  
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
  
    calculateCanvasDimensions = ( absDx: number, absDy: number, boundingBoxBuffer: { vertical: number; horizontal: number }): {
        canvasWidth: number;
        canvasHeight: number;
    } => {
        const canvasWidth = absDx + 2 * boundingBoxBuffer.horizontal;
        const canvasHeight = absDy + 2 * boundingBoxBuffer.vertical;
    
        return { canvasWidth, canvasHeight };
  };

    calculateFlowComponents = (startPoint: Point, endPoint: Point, boundingBoxElementBuffer: number): 
    {p1: Point, p4: Point, canvasWidth: number, canvasHeight: number, canvasXOffset: number, canvasYOffset: number} => {
        
        const {dy, dx, absDy, absDx} = this.calculateDeltas(startPoint, endPoint);
        const {p1,p4,boundingBoxBuffer} = this.calculateControlPointsWithBuffer(boundingBoxElementBuffer, absDx, absDy, dx, dy)    
        const { canvasWidth, canvasHeight } = this.calculateCanvasDimensions(absDx, absDy, boundingBoxBuffer);
        const canvasXOffset = Math.min(startPoint.x, endPoint.x) - boundingBoxBuffer.horizontal; 
        const canvasYOffset = Math.min(startPoint.y, endPoint.y) - boundingBoxBuffer.vertical;

        return {p1,p4,canvasWidth,canvasHeight,canvasXOffset,canvasYOffset}
    }
  
}