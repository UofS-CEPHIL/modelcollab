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
    const [readOnly, setReadOnly] = useState<boolean>(true);

    const onDrag: React.DragEventHandler = (event: React.DragEvent) => {

        if (event.clientX > -1 && event.clientY > -1) {
            const newShared = { ...sharedState, x: event.clientX, y: event.clientY };
            setSharedState(newShared);
            props.firebaseDataModel.updateComponent(props.sessionId, props.componentId, newShared);
        }
    }

    const onDoubleClick: React.MouseEventHandler = (_: React.MouseEvent) => {
        setReadOnly(false);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newShared = { ...sharedState, text: event.target.value };
        props.firebaseDataModel.updateComponent(props.sessionId, props.componentId, newShared);
    };

    const onBlur: React.FocusEventHandler = () => {
        setReadOnly(true);
    }

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.componentId, (data) => {
        let newData = data as SharedState;
        if (newData.x !== sharedState.x
            || newData.y !== sharedState.y
            || newData.text.localeCompare(sharedState.text) !== 0
        ) {
            setSharedState(newData);
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
            id={`${props.componentId}`}
            draggable="true"
            onDragEnd={onDrag}
            data-testid="stock-div"
        >
            <TextField id="outlined-basic"
                value={sharedState.text}
                onChange={handleChange}
                onBlur={onBlur}
                onDoubleClick={onDoubleClick}
                inputProps={{
                    className: "Mui_Stock",
                    id: `${props.componentId}`,
                    readOnly: readOnly,
                    "data-testid": "stock-textfield-mui"
                }}
            />
        </div>

    );
}

export default Stock;
