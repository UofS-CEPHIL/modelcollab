import React, { FC } from 'react';
import { ArrowUtils } from '../../utils/ArrowUtils';
import { FirebaseComponentModel as schema } from "database/build/export";
import FirebaseDataModel from '../../data/FirebaseDataModel';
import TextField from '@mui/material/TextField';
import { LabelUtils } from '../../utils/LabelUtils';


export const FLOW_LABEL_DEFAULT_WIDTH = 80;
export const FLOW_LABEL_DEFAULT_FONT_SIZE = 12;
export const FLOW_LABEL_DEFAULT_HEIGHT = 23;
export const BOUNDING_BOX_ELEMENT_BUFFER = 70;


export interface Props {
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

    labelPoint: Point,

    flow: schema.FlowFirebaseComponent
};

const Flow: FC<Props> = (props) => {

    const arrow = new ArrowUtils();
    const label = new LabelUtils();

    const [sharedState, setSharedState] = React.useState<flowLocal>({
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 0, y: 0 },

        calculatedStartPoint: { x: 0, y: 0 },
        calculatedEndPoint: { x: 0, y: 0 },

        canvasWidth: 0,
        canvasHeight: 0,

        canvasXOffset: 0,
        canvasYOffset: 0,

        labelPoint: { x: 0, y: 0 },

        flow: new schema.FlowFirebaseComponent(props.componentId, {
            from: props.from,
            to: props.to,
            text: props.text,
            equation: props.equation,
            dependsOn: props.dependsOn
        })
    });

    const triggerCallback = (data: schema.FirebaseDataComponent): void => {

        console.log("callback");
        if (data && data.getType() === schema.ComponentType.STOCK) {
            const stock = data as schema.StockFirebaseComponent;
            console.log("stock");
            if (stock.getId() === props.from && (stock.getData().x !== sharedState.startPoint.x || stock.getData().y !== sharedState.startPoint.y)) {
                console.log(`from: ${stock.getData()} - sharedState = ${sharedState}`);
                const newStart: Point = { x: stock.getData().x, y: stock.getData().y };

                const { p1, p4, canvasWidth, canvasHeight, canvasXOffset, canvasYOffset, dx, dy } = arrow.calculateArrowComponent(newStart, sharedState.endPoint, BOUNDING_BOX_ELEMENT_BUFFER)
                const { labelPoint } = label.calculateLabelComponent({ dx, dy, canvasHeight, canvasWidth, canvasXOffset, canvasYOffset });
                const newSharedState = {
                    ...sharedState,
                    startPoint: newStart,
                    calculatedStartPoint: p1,
                    calculatedEndPoint: p4,
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                    canvasXOffset: canvasXOffset,
                    canvasYOffset: canvasYOffset,
                    labelPoint: labelPoint
                };

                setSharedState(newSharedState);
            }

            else if (stock.getId() === props.to && (stock.getData().x !== sharedState.endPoint.x || stock.getData().y !== sharedState.endPoint.y)) {
                console.log(`to: ${stock.getData()} - sharedState = ${sharedState}`);
                const newEnd: Point = { x: stock.getData().x, y: stock.getData().y };

                const { p1, p4, canvasWidth, canvasHeight, canvasXOffset, canvasYOffset, dx, dy } = arrow.calculateArrowComponent(sharedState.startPoint, newEnd, BOUNDING_BOX_ELEMENT_BUFFER)
                const { labelPoint } = label.calculateLabelComponent({ dx, dy, canvasHeight, canvasWidth, canvasXOffset, canvasYOffset });

                const newSharedState = {
                    ...sharedState,
                    endPoint: newEnd,
                    calculatedStartPoint: p1,
                    calculatedEndPoint: p4,
                    canvasWidth: canvasWidth,
                    canvasHeight: canvasHeight,
                    canvasXOffset: canvasXOffset,
                    canvasYOffset: canvasYOffset,
                    labelPoint: labelPoint
                };

                setSharedState(newSharedState);
            }
        }
        else if (data && data.getType() === schema.ComponentType.FLOW) {
            console.log(`flow: ${data.getData()}`);
            if (!sharedState.flow.equals(data)) {
                setSharedState({ ...sharedState, flow: data as schema.FlowFirebaseComponent });
            }
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newData = { ...sharedState.flow.getData(), text: event.target.value };
        const newState: schema.FlowFirebaseComponent = sharedState.flow.withData(newData);
        props.firebaseDataModel.updateComponent(props.sessionId, newState);
    };

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.from, triggerCallback);
    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.to, triggerCallback);
    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.componentId, triggerCallback);

    return (
        <div style={{ position: "absolute" }}>
            <svg
                width={sharedState.canvasWidth}
                height={sharedState.canvasHeight}
                style={{
                    backgroundColor: "transparent",
                    transform: `translate(${sharedState.canvasXOffset}px, ${sharedState.canvasYOffset}px)`,
                }}
                className="Flow-svg"
                id={props.componentId}
                data-testid="flow-svg"
            >
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth" data-testid="flow-arrowhead">
                        <path d="M0,0 L0,6 L9,3 z" fill="black" />
                    </marker>
                </defs>

                <line
                    data-testid="flow-line"
                    className="Flow-line"
                    stroke="black"
                    strokeWidth={8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    x1={sharedState.calculatedStartPoint.x}
                    y1={sharedState.calculatedStartPoint.y}
                    x2={sharedState.calculatedEndPoint.x}
                    y2={sharedState.calculatedEndPoint.y}
                    markerEnd="url(#arrow)"
                />
                <line
                    data-testid="flow-inner-line"
                    className="flow-inner-line"
                    stroke="white"
                    strokeWidth={5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    x1={sharedState.calculatedStartPoint.x}
                    y1={sharedState.calculatedStartPoint.y}
                    x2={sharedState.calculatedEndPoint.x}
                    y2={sharedState.calculatedEndPoint.y}
                />



            </svg>

            <div
                style={{
                    position: "absolute",
                    left: `${sharedState.labelPoint.x}px`,
                    top: `${sharedState.labelPoint.y}px`,
                }}
                data-testid="flow-text-div"
            >

                <TextField id="outlined-basic"
                    value={sharedState.flow.getData().text}
                    onChange={handleChange}
                    size='small'
                    inputProps={{
                        style: { fontSize: FLOW_LABEL_DEFAULT_FONT_SIZE, width: `${FLOW_LABEL_DEFAULT_WIDTH}px` },
                        className: "Mui_Flow",
                        id: props.componentId,
                        color: "white",
                        "data-testid": "flow-textfield-mui"
                    }}
                />
            </div>
        </div>
    )

}

export default Flow;
