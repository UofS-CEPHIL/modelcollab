import React, { FC, useState } from 'react';
import Stock from "./Stock";

interface Point {
    x: number;
    y: number;
}

const Canvas: FC<any> = () => {
    return (
        <div>
            <Stock x={10} y={10} color={'red'} />
        </div>
    );
}

export default Canvas;
