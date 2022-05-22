import TextField from '@mui/material/TextField';
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
    text: string
    color: string
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
            text: props.text,
        }
    );
    const [readOnly, setReadOnly] = useState<boolean>(true)
    const [text, setText] = useState<string>(props.text)

    const onDrag: React.DragEventHandler = (event: React.DragEvent) => {

        if (event.clientX > -1 && event.clientY > -1){

            const newShared = { ...sharedState, x: event.clientX, y: event.clientY };
            
            setSharedState(newShared);
            props.firebaseDataModel.updateComponent(props.sessionId, props.componentId, newShared);
        }
    }

    const onDoubleClick: React.MouseEventHandler = (event: React.MouseEvent) => {
        setReadOnly(false)
    }

    

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value)
        console.log("handlechange")
    };

    const onBlur: () => void = () => {

        if (text.localeCompare(sharedState.text) !== 0){
            const newShared = { ...sharedState, text: text };
            setSharedState(newShared);
            props.firebaseDataModel.updateComponent(props.sessionId, props.componentId, newShared);
        }
        console.log("onblur")
        setReadOnly(true)
    }

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.componentId, (data) => {
        let newData = data as SharedState;

        if (newData.x !== sharedState.x || newData.y !== sharedState.y)
            setSharedState(newData);

        else if (newData.text.localeCompare(sharedState.text) !== 0){
            // setText(newData.text)
            console.log("sub")
        }
    });


    return (

        <div
            style={{
                position: "absolute",
                left: `${sharedState.x}px`,
                top: `${sharedState.y}px`,
                background: props.color,  
            }}
            className = "stock"
            id={`${props.componentId}`}

            draggable="true"
            onDragEnd={onDrag}
            data-testid="stock-div"
        >
        {/* <TextField className="Mui" id="outlined-basic" variant="outlined" /> */}

        <TextField id="outlined-basic"
            value={text}
            inputProps={{
                onChange: handleChange,
                onBlur: onBlur,
                className: "Mui_Stock",
                id: `${props.componentId}`,
                readOnly: readOnly,
                onDoubleClick: onDoubleClick
            }}
        />
        </div>

    );
}

export default Stock;
