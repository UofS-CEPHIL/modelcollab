import {Point} from "../components/Canvas/Flow"

import { HEIGHT_PX, WIDTH_PX } from '../components/Canvas/Stock';

//source: https://www.productboard.com/blog/how-we-implemented-svg-arrows-in-react-the-curvature-2-3/
export class ArrowUtils {

    linearEquation(coefficient:number,x :number, constant: number = 0){
        return Math.abs((coefficient*x + constant))
    }

    calculateDeltas = (startPoint: Point, endPoint: Point): {dx: number, dy: number, absDx: number, absDy: number} => {
       
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

    calculateArrowComponent = (startPoint: Point, endPoint: Point, boundingBoxElementBuffer: number): 
    {p1: Point, p4: Point, canvasWidth: number, canvasHeight: number, canvasXOffset: number, canvasYOffset: number, dy: number, dx: number } => {
           
        let localEndPoint: Point;
        const startCenterPoint: Point = {x : startPoint.x + (WIDTH_PX/2), y: startPoint.y + (HEIGHT_PX/2) }

        // const startCenterPoint: Point = {x : startPoint.x , y: startPoint.y  }
        // console.log(startPoint,endPoint)
        if ( ((startPoint.x >= endPoint.x && startPoint.x <= (endPoint.x + WIDTH_PX)) || (startPoint.x + WIDTH_PX >= endPoint.x && startPoint.x + WIDTH_PX<= (endPoint.x + WIDTH_PX)) )
            && startCenterPoint.y < endPoint.y){

            localEndPoint = {x: endPoint.x + (WIDTH_PX/2), y: endPoint.y - boundingBoxElementBuffer}
        }

        else if( ((startPoint.x >= endPoint.x && startPoint.x <= (endPoint.x + WIDTH_PX)) || (startPoint.x + WIDTH_PX >= endPoint.x && startPoint.x + WIDTH_PX<= (endPoint.x + WIDTH_PX)) )
            && startCenterPoint.y > endPoint.y){
            localEndPoint = {x: endPoint.x + (WIDTH_PX/2), y: endPoint.y + (HEIGHT_PX) + boundingBoxElementBuffer + 15} 
        }

        else if ( ( (startPoint.y >= endPoint.y && startPoint.y <= endPoint.y + HEIGHT_PX) || (startPoint.y + HEIGHT_PX>= endPoint.y && startPoint.y +HEIGHT_PX <= endPoint.y + HEIGHT_PX) )
            && startCenterPoint.x < endPoint.x){
            localEndPoint = {x: endPoint.x - boundingBoxElementBuffer , y: endPoint.y + (HEIGHT_PX/2)}
        }

        else if (( (startPoint.y >= endPoint.y && startPoint.y <= endPoint.y + HEIGHT_PX) || (startPoint.y + HEIGHT_PX>= endPoint.y && startPoint.y +HEIGHT_PX <= endPoint.y + HEIGHT_PX) )
            && startCenterPoint.x > endPoint.x){
            localEndPoint = {x: endPoint.x + WIDTH_PX + boundingBoxElementBuffer, y: endPoint.y + (HEIGHT_PX/2)}
        }

        //special cases
        else if (startCenterPoint.x > endPoint.x && startCenterPoint.y < endPoint.y){
            localEndPoint = {x: endPoint.x + WIDTH_PX , y: endPoint.y - boundingBoxElementBuffer}
        }

        else if (startCenterPoint.x > endPoint.x && startCenterPoint.y > endPoint.y){
            localEndPoint = {x: endPoint.x + WIDTH_PX + boundingBoxElementBuffer, y: endPoint.y + HEIGHT_PX}
        }

        else if (startCenterPoint.x < endPoint.x && startCenterPoint.y > endPoint.y){
            localEndPoint = {x: endPoint.x - boundingBoxElementBuffer , y: endPoint.y + HEIGHT_PX}
        }
        else{
            localEndPoint = {x: endPoint.x, y: endPoint.y - boundingBoxElementBuffer}
        }

        const {dy, dx, absDy, absDx} = this.calculateDeltas(startCenterPoint, localEndPoint);
        const {p1,p4,boundingBoxBuffer} = this.calculateControlPointsWithBuffer(boundingBoxElementBuffer, absDx, absDy, dx, dy)    
        const {canvasWidth, canvasHeight } = this.calculateCanvasDimensions(absDx, absDy, boundingBoxBuffer);
        const canvasXOffset = Math.min(startCenterPoint.x, localEndPoint.x) - boundingBoxBuffer.horizontal; 
        const canvasYOffset = Math.min(startCenterPoint.y, localEndPoint.y) - boundingBoxBuffer.vertical;

        return {p1,p4,canvasWidth,canvasHeight,canvasXOffset,canvasYOffset, dy, dx}
    }
  
}