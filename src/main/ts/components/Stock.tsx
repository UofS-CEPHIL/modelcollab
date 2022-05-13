import React, { FC, useState } from 'react';
import { getDatabase, ref, set, onValue } from "firebase/database";
import firebaseApp from "../firebase";

const WIDTH_PX = 20;
const HEIGHT_PX = 20;
const DEFAULT_COLOR = "blue";
const SELECTED_COLOR = "red";

const makePath = (sessionId: string, componentId: string) =>
    `components/${sessionId}/${componentId}/data`;

interface Props {
    initx: number;
    inity: number;
    componentId: string;
    sessionId: string;
}

interface SharedState {
    x: number;
    y: number;
    text: string;
    initvalue: string;
}


const Stock: FC<Props> = (props: Props) => {

    const [sharedState, setSharedState] = useState<SharedState>(
        {
            x: props.initx,
            y: props.inity,
            text: "",
            initvalue: ""
        }
    );

    const onDrag: React.DragEventHandler = (event: React.DragEvent) => {
        const newShared = { ...sharedState, x: event.clientX, y: event.clientY };
        setSharedState(newShared);
        set(
            ref(
                getDatabase(firebaseApp),
                makePath(props.sessionId, props.componentId)
            ),
            newShared
        );
    }

    onValue(
        ref(
            getDatabase(firebaseApp),
            makePath(props.sessionId, props.componentId)
        ),
        (snapshot) => {
            const data = snapshot.val();
            if (
                data
                && data.x != sharedState.x
                && data.y != sharedState.y
            ) {
                setSharedState({ ...sharedState, x: data.x, y: data.y });
            }
        }
    );

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
        />
    );
}

export default Stock;
