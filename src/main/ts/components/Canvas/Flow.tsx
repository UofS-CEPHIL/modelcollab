import React, {FC} from 'react';
import { ArrowUtils } from '../../utils/ArrowUtils';
import { FirebaseDataComponent, FlowFirebaseComponent, StockFirebaseComponent, ComponentType } from '../../data/FirebaseComponentModel';
import FirebaseDataModel from '../../data/FirebaseDataModel';


export interface Props{
    componentId: string,
    sessionId: string,
    text: string,
    from: string,
    to: string,
    equation: string,      
    dependsOn: string[], 
    firebaseDataModel: FirebaseDataModel
};

export type Point = {
    x: number,
    y: number
};

export interface flowLocal {
    startPoint: Point,
    endPoint: Point,

    calculatedStartPoint: Point,
    calculatedEndPoint: Point,

    canvasWidth: number,
    canvasHeight: number,

    canvasXOffset: number,
    canvasYOffset: number,
    
    flow: FlowFirebaseComponent
};

const Flow: FC<Props> = (props) => {

    const boundingBoxElementBuffer = 1;
    const arrow = new ArrowUtils();


    const [sharedState,setSharedState] = React.useState<flowLocal>({
        startPoint: {x:0,y:0},
        endPoint: {x:0,y:0},

        calculatedStartPoint: {x:0,y:0},
        calculatedEndPoint: {x:0,y:0},

        canvasWidth: 0,
        canvasHeight: 0,
        
        canvasXOffset: 0,
        canvasYOffset: 0,


        flow: new FlowFirebaseComponent(props.componentId, {
            text: props.text,
            from: props.from,
            to: props.to,
            dependsOn: props.dependsOn,
            equation: props.equation,
        })
    });

    const triggerCallback = (data: FirebaseDataComponent): void => {

        if (data.getType() === ComponentType.STOCK){
            const stock = data as StockFirebaseComponent;

            if ( stock.getId() === props.from && (stock.getData().x !== sharedState.startPoint.x || stock.getData().y !== sharedState.startPoint.y)){
                const newStart: Point = {x: stock.getData().x, y: stock.getData().y};

                const {p1,p4,canvasWidth,canvasHeight,canvasXOffset,canvasYOffset} = arrow.calculateFlowComponents(newStart,sharedState.endPoint,boundingBoxElementBuffer)
                
                const newSharedState = {
                    ...sharedState, 
                    startPoint: newStart, 
                    calculatedStartPoint: p1,
                    calculatedEndPoint: p4, 
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                    canvasXOffset: canvasXOffset,
                    canvasYOffset: canvasYOffset};
                
                setSharedState(newSharedState);      
            }

            else if ( stock.getId() === props.to && (stock.getData().x !== sharedState.endPoint.x || stock.getData().y !== sharedState.endPoint.y)){
                const newEnd: Point = {x: stock.getData().x, y: stock.getData().y};

                const {p1,p4, canvasWidth,canvasHeight,canvasXOffset,canvasYOffset} = arrow.calculateFlowComponents(sharedState.startPoint,newEnd,boundingBoxElementBuffer)
                
                const newSharedState = {
                    ...sharedState, 
                    endPoint: newEnd,
                    calculatedStartPoint: p1,
                    calculatedEndPoint: p4, 
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                    canvasXOffset: canvasXOffset,
                    canvasYOffset: canvasYOffset};
                
                setSharedState(newSharedState);  
            }
        }
    }
    

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.from, triggerCallback);

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.to, triggerCallback);

    // props.firebaseDataModel.subscribeToComponent(props.sessionId,props.componentId,(data: FirebaseDataComponent) => {
    //     const flow = data as FlowFirebaseComponent;

    //     if(!sharedState.flow.equals(flow)){
    //         const newSharedState = {...sharedState, flow: flow};
    //         setSharedState( newSharedState);
    //     }
    // });


    return (
        <div>
            <svg
                width={sharedState.canvasWidth}
                height={sharedState.canvasHeight}
                style={{
                    backgroundColor: "#fff",
                    transform: `translate(${sharedState.canvasXOffset}px, ${sharedState.canvasYOffset}px)`,
                }}
                data-testid="flow-svg"
                >
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth" data-testid="flow-arrowhead">
                        <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
                    </marker>
                </defs>

                <line
                    data-testid="flow-line"
                    stroke="#aaa"
                    strokeWidth={1}
                    x1={sharedState.calculatedStartPoint.x}
                    y1={sharedState.calculatedStartPoint.y}
                    x2={sharedState.calculatedEndPoint.x}
                    y2={sharedState.calculatedEndPoint.y}
                    markerEnd="url(#arrow)"
                />
            </svg>
        </div>);
}

export default Flow;