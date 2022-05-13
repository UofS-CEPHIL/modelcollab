import React, { Fragment, useRef } from 'react';
import Canvas from "./components/Canvas"
import Toolbar from "./components/Toolbar/Toolbar"


function App() {
    const divRef = useRef<HTMLDivElement>(null)

    let DOMReact: DOMRect | undefined | null = divRef.current?.getClientRects().item(0)
    
    let maxX: number = -1
    let maxY: number = -1

    if (DOMReact !== undefined && DOMReact !== null ){
        maxX = DOMReact.x
        maxY = DOMReact.y
    }

    console.log(maxX, maxY)

    return (
        <Fragment>
            <Toolbar/>

            <div ref = {divRef}>
                <Canvas maxX = {maxX} maxY = {maxY}/>
            </div>
           
        </Fragment>
            
    );
}

export default App;
