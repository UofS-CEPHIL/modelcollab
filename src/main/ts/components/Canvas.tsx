import React, { FC, useState } from 'react';
import Stock from "./Stock";

interface Props {
    maxX: number;
    maxY: number
}

const Canvas: FC<any> = ( props: Props ) => {
    return (
        
        <div>
            <Stock x={props.maxX} y={props.maxY} color={'red'} />
        </div>
    );
}

export default Canvas;
