import React, { Fragment, useEffect, useRef, useState } from 'react';
import Canvas from "./components/Canvas/Canvas"
import Toolbar from "./components/Toolbar/Toolbar"


function App() {
    const divRef = useRef<HTMLDivElement>(null)

    let DOMReact: DOMRect | undefined | null = divRef.current?.getClientRects().item(0)
    
    let maxX: number = -1
    let maxY: number = 57

    //This one will be used as componentDidmount to update the position of the Canvas after it is rendered. TODO: figure if this is necessary or we can predefined the max position
    useEffect(() => {
        if (DOMReact !== undefined && DOMReact !== null ){
            maxX = DOMReact.x
            maxY = DOMReact.y
        }
    },[DOMReact]);

    //by default mode will be move
    const [mode, setMode] = useState<string>("Move");
    
    return (
        <Fragment>
            <Toolbar mode = {mode} setMode = {setMode} />

            <div ref = {divRef}>
                <Canvas mode = {mode} maxX = {maxX} maxY = {maxY}/>
            </div>

        </Fragment>
    );
}

export default App;
