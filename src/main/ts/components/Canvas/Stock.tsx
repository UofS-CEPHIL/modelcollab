import TextField from '@mui/material/TextField';
import React, { FC, useState } from 'react';
import { FirebaseDataComponent, StockFirebaseComponent } from '../../data/FirebaseComponentModel';

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

const Stock: FC<Props> = (props) => {

    const [sharedState, setSharedState] = useState<StockFirebaseComponent>(
        new StockFirebaseComponent(props.componentId, {
            x: props.initx,
            y: props.inity,
            text: props.text,
            initvalue: ""
        })
    );
    const [readOnly, setReadOnly] = useState<boolean>(true);

    const onDrag: React.DragEventHandler = (event: React.DragEvent) => {

        if (event.clientX > -1 && event.clientY > -1) {
            const newData = { ...sharedState.getData(), x: event.clientX, y: event.clientY };
            const newState: StockFirebaseComponent = sharedState.withData(newData);
            setSharedState(newState);
            props.firebaseDataModel.updateComponent(props.sessionId, newState);
        }
    }

    const onDoubleClick: React.MouseEventHandler = (_: React.MouseEvent) => {
        setReadOnly(false);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newData = { ...sharedState.getData(), text: event.target.value };
        const newState: StockFirebaseComponent = sharedState.withData(newData);
        props.firebaseDataModel.updateComponent(props.sessionId, newState);
    };

    const onBlur: React.FocusEventHandler = () => {
        setReadOnly(true);
    }

    props.firebaseDataModel.subscribeToComponent(props.sessionId, props.componentId, (data: FirebaseDataComponent) => {
        setSharedState(data as StockFirebaseComponent);
    });

    return (
        <div
            style={{
                position: "absolute",
                left: `${sharedState.getData().x}px`,
                top: `${sharedState.getData().y}px`,
                background: props.color,
            }}
            id={`${props.componentId} `}
            draggable="true"
            onDragEnd={onDrag}
            data-testid="stock-div"
        >
            <TextField id="outlined-basic"
                value={sharedState.getData().text}
                onChange={handleChange}
                onBlur={onBlur}
                onDoubleClick={onDoubleClick}
                inputProps={{
                    className: "Mui_Stock",
                    id: `${props.componentId} `,
                    readOnly: readOnly,
                    "data-testid": "stock-textfield-mui"
                }}
            />
        </div>

    );
}

export default Stock;
