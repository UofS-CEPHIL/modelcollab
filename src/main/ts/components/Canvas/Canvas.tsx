import React, { FC, useState } from 'react';
import Stock from "../Stock";

interface Props {
    mode: string;
    maxX: number;
    maxY: number
}

const Canvas: FC<any> = ( props: Props ) => {
    
    switch (props.mode){
        case 'Move':
            console.log("Move component is activated")
            return (
                    <div>
                        <Stock x={props.maxX} y={props.maxY} color={'red'} />
                    </div>
            )
        case 'Create':
            console.log("Create componenet activated")
            return (
                <div>
                <Stock x={props.maxX} y={props.maxY} color={'red'} />
            </div>
            )
        case 'Delete':
            console.log("Delete componenet activated")
            return (    
                <div>
                <Stock x={props.maxX} y={props.maxY} color={'red'} />
                </div>
            )
        default:
            console.error("something's wrong")
            return (
                <div>
                <Stock x={props.maxX} y={props.maxY} color={'red'} />
            </div>
            )
    }


    
}

export default Canvas;
