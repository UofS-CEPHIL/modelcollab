import React, { FC, useState } from 'react';

const WIDTH_PX = 20;
const HEIGHT_PX = 20;

interface Props {
    x: number;
    y: number;
    color: string;
}

interface State {
    x: number;
    y: number;
    color: string;
}

const Stock: FC<Props> = (props: Props) => {

    const [state, setState] = useState<State>(
        {
            x: props.x,
            y: props.y,
            color: props.color
        }
    );

    const onDrag: React.DragEventHandler =
        (event: React.DragEvent) => setState({ ...state, x: event.clientX, y: event.clientY });

    return (
        <div
            style={{
                position: "absolute",
                left: `${state.x}px`,
                top: `${state.y}px`,
                width: `${WIDTH_PX}px`,
                height: `${HEIGHT_PX}px`,
                background: state.color
            }}
            draggable="true"
            onDrag={onDrag}
            onDragEnd={onDrag}
        />
    );
}

export default Stock;
