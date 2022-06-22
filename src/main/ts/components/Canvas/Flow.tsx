import React, {FC} from 'react';
import { ArrowUtils } from '../../utils/ArrowUtils';
import { FirebaseDataComponent, FlowFirebaseComponent, StockFirebaseComponent, ComponentType } from '../../data/FirebaseComponentModel';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import TextField from '@mui/material/TextField';


export const FLOW_LABEL_DEFAULT_WIDTH = 70;
export const FLOW_LABEL_DEFAULT_FONT_SIZE = 12;

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

    absDx: number,
    absDy: number,

    labelPoint: Point,
    
    flow: FlowFirebaseComponent
};

const Flow: FC<Props> = (props) => {

    const boundingBoxElementBuffer = 7;
    const arrow = new ArrowUtils();
    // const label = new LabelUtils();

    // const [readOnly, setReadOnly] = React.useState<boolean>(true);

    const [sharedState,setSharedState] = React.useState<flowLocal>({
        startPoint: {x:0,y:0},
        endPoint: {x:0,y:0},

        calculatedStartPoint: {x:0,y:0},
        calculatedEndPoint: {x:0,y:0},

        canvasWidth: 0,
        canvasHeight: 0,
        
        canvasXOffset: 0,
        canvasYOffset: 0,

        absDx: 0,
        absDy: 0,

        labelPoint: {x:0,y:0},

        flow: new FlowFirebaseComponent(props.componentId, {
            from: props.from,
            to: props.to,
            text: props.text,
            equation: props.equation,
            dependsOn: props.dependsOn    
        })
    });

    const triggerCallback = (data: FirebaseDataComponent): void => {

        if (data.getType() === ComponentType.STOCK){
            const stock = data as StockFirebaseComponent;

            if ( stock.getId() === props.from && (stock.getData().x !== sharedState.startPoint.x || stock.getData().y !== sharedState.startPoint.y)){
                const newStart: Point = {x: stock.getData().x, y: stock.getData().y};

                const {p1,p4,canvasWidth,canvasHeight,canvasXOffset,canvasYOffset,absDy,absDx} = arrow.calculateArrowComponent(newStart,sharedState.endPoint,boundingBoxElementBuffer)
                //const {x,y} = label.calculateLabelComponent
                const newSharedState = {
                    ...sharedState, 
                    startPoint: newStart, 
                    calculatedStartPoint: p1,
                    calculatedEndPoint: p4, 
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                    canvasXOffset: canvasXOffset,
                    canvasYOffset: canvasYOffset,
                    absDy: absDy,
                    absDx: absDx
                };

                setSharedState(newSharedState);      
            }

            else if ( stock.getId() === props.to && (stock.getData().x !== sharedState.endPoint.x || stock.getData().y !== sharedState.endPoint.y)){
                const newEnd: Point = {x: stock.getData().x, y: stock.getData().y};


                const {p1,p4, canvasWidth,canvasHeight,canvasXOffset,canvasYOffset,absDy,absDx} = arrow.calculateArrowComponent(sharedState.startPoint,newEnd,boundingBoxElementBuffer)
                
                const newSharedState = {
                    ...sharedState, 
                    endPoint: newEnd,
                    calculatedStartPoint: p1,
                    calculatedEndPoint: p4, 
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                    canvasXOffset: canvasXOffset,
                    canvasYOffset: canvasYOffset,
                    absDy: absDy,
                    absDx: absDx
                };
                    
                setSharedState(newSharedState);  
            }
        }
        else if (data.getType() === ComponentType.FLOW){
            
            if(!sharedState.flow.equals(data)){
                setSharedState({...sharedState, flow: data as FlowFirebaseComponent});
            }
        }
    }

    // const onDoubleClick: React.MouseEventHandler = (_: React.MouseEvent) => {
    //     setReadOnly(false);
    // }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const newData = { ...sharedState.flow.getData(), text: event.target.value };           
        const newState: FlowFirebaseComponent = sharedState.flow.withData(newData);
        props.firebaseDataModel.updateComponent(props.sessionId, newState);
    };

    // const onBlur: React.FocusEventHandler = () => {
    //     setReadOnly(true);
    // }
    
    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.from, triggerCallback);
    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.to, triggerCallback);
    props.firebaseDataModel.subscribeToComponent(props.sessionId,props.componentId,triggerCallback);

    return (
        <div style = {{position: "absolute"}}>
            <svg
                width={sharedState.canvasWidth}
                height={sharedState.canvasHeight}
                style={{
                    backgroundColor: "transparent",
                    transform: `translate(${sharedState.canvasXOffset}px, ${sharedState.canvasYOffset}px)`,
                }}
                className = "Flow-svg"
                id = {props.componentId}
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

            <div> 
            <TextField id="outlined-basic"
                    value={sharedState.flow.getData().text}
                    onChange={handleChange}
                    // onBlur={onBlur}
                    // onDoubleClick={onDoubleClick}
                    size="small"
                    inputProps={{
                        style: {fontSize: FLOW_LABEL_DEFAULT_FONT_SIZE, width:`${FLOW_LABEL_DEFAULT_WIDTH}px`},
                        className: "Mui_Flow",
                        id: props.componentId,
                        // readOnly: readOnly,
                        "data-testid": "flow-textfield-mui"
                    }}
            />
            </div>       
        </div>
    )
        
}

export default Flow;