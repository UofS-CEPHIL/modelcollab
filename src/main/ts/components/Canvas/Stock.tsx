import React, { FC, useState } from 'react';
import FirebaseDataModel from '../../data/FirebaseDataModel';

export const WIDTH_PX = 20;
export const HEIGHT_PX = 20;
export const DEFAULT_COLOR = "blue";
export const SELECTED_COLOR = "red";

export interface Props {
    initx: number;
    inity: number;
    componentId: string;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}

interface SharedState {
    x: number;
    y: number;
    text: string;
}

const Stock: FC<Props> = (props) => {

    const [sharedState, setSharedState] = useState<SharedState>(
        {
            x: props.initx,
            y: props.inity,
            text: "",
        }
    );

    const onDrag: React.DragEventHandler = (event: React.DragEvent) => {

        if (event.clientX > -1 && event.clientY > -1){
            const newShared = { ...sharedState, x: event.clientX, y: event.clientY };
            setSharedState(newShared);
            props.firebaseDataModel.updateComponent(props.sessionId, props.componentId, newShared);
        }
    }

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.componentId, (data) => {
        let newData = data as SharedState;

        if (newData.x !== sharedState.x && newData.y !== sharedState.y)
            setSharedState(newData);
    });


    return (
        <div
            style={{
                position: "absolute",
                left: `${sharedState.x}px`,
                top: `${sharedState.y}px`,
                width: `${WIDTH_PX}px`,
                height: `${HEIGHT_PX}px`,
                background: DEFAULT_COLOR
            }}

            draggable="true"
            onDragEnd={onDrag}
            data-testid="stock-div"
        />

    );
}

export default Stock;
