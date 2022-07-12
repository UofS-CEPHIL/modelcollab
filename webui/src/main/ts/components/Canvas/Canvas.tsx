<<<<<<< HEAD
import React, { FC, useState } from 'react';

import { FirebaseDataModel } from "database/build/data/FirebaseDataModel";
import { StockFirebaseComponent } from 'database/build/data/FirebaseComponentModel';

import Stock, { DEFAULT_COLOR, SELECTED_COLOR, } from "./Stock";
import IdGenerator from "../../IdGenerator";
import "./Styles.css"
import { UiMode } from './UiMode';
=======
import React, { FC } from 'react';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { UiMode } from './Mode/Mode';
import { ComponentType, FlowFirebaseComponent, StockFirebaseComponent } from '../../data/FirebaseComponentModel';

import { DataContainer } from '../../data/DataContainer';

import MoveMode from './Mode/MoveMode';
import CreateMode from './Mode/CreateMode';
import DeleteMode from './Mode/DeleteMode';
import FlowMode from './Mode/FlowMode';
import EditMode from './Mode/EditMode';
>>>>>>> Long-branch


export const modeFromString = (s: string) => {
    s = s.toUpperCase();
    let out: UiMode | null;
    if (s === "CREATE") out = UiMode.CREATE;
    else if (s === "DELETE") out = UiMode.DELETE;
    else if (s === "MOVE") out = UiMode.MOVE;
<<<<<<< HEAD
=======
    else if (s === "FLOW") out = UiMode.FLOW;
    else if (s === "EDIT") out = UiMode.EDIT;
>>>>>>> Long-branch
    else out = null;
    return out;
};

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    mode: UiMode;
}


const Canvas: FC<Props> = (props: Props) => {
<<<<<<< HEAD

    const idGenerator = new IdGenerator();

    const [stocks, setStocks] = React.useState<StockFirebaseComponent[]>([]);
    const [selected, setSelected] = useState<string | null>(null);

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {
        if (props.mode === UiMode.CREATE) {
            setSelected(null);
            const componentID = idGenerator.generateComponentId();
            const newStock = new StockFirebaseComponent(
                componentID.toString(),
                { text: "", x: event.clientX, y: event.clientY, initvalue: "" }
            );
            props.firebaseDataModel.updateComponent(props.sessionId, newStock);
        }
        else if (props.mode === UiMode.MOVE
            && (event.target as Element).className
                .split(" ")
                .find(item => ["Mui_Stock"].indexOf(item) > -1)
        ) {
            setSelected((event.target as Element).id);
        }

        else if (props.mode === UiMode.DELETE) {
            setSelected(null);
            if ((event.target as Element).className
                .split(" ")
                .find(item => ["Mui_Stock"].indexOf(item) > -1)
            ) {
                const id = (event.target as Element).id
                props.firebaseDataModel.removeComponent(props.sessionId, id);
            }
        }
    }

    props.firebaseDataModel.registerComponentCreatedListener(props.sessionId, (stock) => {
        if (stock) {
            if (!stocks.some(s => s.getId() === stock.getId())) {
                setStocks([...stocks, stock as StockFirebaseComponent]);
            }
        }
    })

    props.firebaseDataModel.registerComponentRemovedListener(props.sessionId, (id) => {
        if (id) {
            setStocks(stocks.filter(stock => stock.getId() !== id));
=======
    const [data,setData] = React.useState<DataContainer>(new DataContainer());    
    const renderMode = (props: Props) => {
            switch(props.mode){
                case (modeFromString("MOVE")):
                    return(
                        <div
                            data-testid="canvas-moveMode-div"
                        >
                            <MoveMode 
                                data-testid="move-mode"
                                data = {data}
                                sessionId = {props.sessionId}
                                firebaseDataModel = {props.firebaseDataModel}
                            />
                        </div>
                    ) 
                case (modeFromString("CREATE")):
                    return(
                        <div
                            data-testid="canvas-createMode-div"
                        >
                            <CreateMode 
                                data = {data}
                                sessionId = {props.sessionId}
                                firebaseDataModel = {props.firebaseDataModel}
                            />  
                        </div>  
                    )
                case (modeFromString("DELETE")):
                    return(
                        <div
                            data-testid="canvas-deleteMode-div"
                        >
                            <DeleteMode 
                                data = {data}
                                sessionId = {props.sessionId}
                                firebaseDataModel = {props.firebaseDataModel}
                            />   
                        </div> 
                    )  
                case (modeFromString("FLOW")):
                    return(
                        <div
                            data-testid="canvas-flowMode-div"
                        >
                        <FlowMode 
                            selected = {[]}
                            data = {data}
                            sessionId = {props.sessionId}
                            firebaseDataModel = {props.firebaseDataModel}
                        />  
                        </div>  
                    ) 
                    
                case (modeFromString("EDIT")):
                    return(
                        <div
                            data-testid="canvas-editMode-div"
                        >
                            <EditMode 
                                data = {data}
                                sessionId = {props.sessionId}
                                firebaseDataModel = {props.firebaseDataModel}
                            />    
                        </div>
                    ) 
            }
    }

    props.firebaseDataModel.registerComponentCreatedListener(props.sessionId, (component) => {
        if (component) {
                if (component.getType() === ComponentType.STOCK && !data.getStocks().some(s => s.getId() === component.getId())) {
                    const newStocks = [ ...data.getStocks() , component as StockFirebaseComponent];
                    const newData = data.withStocks(newStocks)
                    
                    setData(newData);
                }
                else if (component.getType() === ComponentType.FLOW && !data.getFlows().some(f => f.getId() === component.getId()) ){
                    const newFlows = [ ...data.getFlows() , component as FlowFirebaseComponent];
                    const newData = data.withFlows(newFlows)

                    setData(newData);
                }
        }    
    })
    
    // const triggerCallBack = (id: string ) => {
    //     if (data.getStocks().some(stock => stock.getId() === id)){
    //         const newStocks = data.getStocks().filter(stock => stock.getId() !== id);
    //         const newData = data.withStocks(newStocks);
    //         setData(newData);
    //     }
    // }

    props.firebaseDataModel.registerComponentRemovedListener(props.sessionId, (id) => {

        if (id) {
            const newFlows = data.getFlows().filter(flow => flow.getId() !== id);
            const newData = data.withFlows(newFlows);
            setData(newData);

            if (data.getStocks().some(stock => stock.getId() === id)){
                const newStocks = data.getStocks().filter(stock => stock.getId() !== id);
                const newData = data.withStocks(newStocks);
                setData(newData);
            }
>>>>>>> Long-branch
        }
    })

    return (
<<<<<<< HEAD
        <div
            className="draggable_container"
            onDragOver={onDragOver}
            onClick={onClick}
            data-testid="canvas-div"
            style={{ "width": "100%", "height": "1000px" }}
        >

            {stocks.map((stock, i) => {
                return (
                    (selected && props.mode === UiMode.MOVE && stock.getId() === selected)
                        ? <div key={i}>
                            <Stock
                                initx={stock.getData().x}
                                inity={stock.getData().y}
                                sessionId={props.sessionId}
                                componentId={stock.getId()}
                                color={SELECTED_COLOR}
                                text={stock.getData().text}
                                firebaseDataModel={props.firebaseDataModel}
                            />
                        </div>
                        : <div key={i}>
                            <Stock
                                initx={stock.getData().x}
                                inity={stock.getData().y}
                                sessionId={props.sessionId}
                                componentId={stock.getId()}
                                color={DEFAULT_COLOR}
                                text={stock.getData().text}
                                firebaseDataModel={props.firebaseDataModel}
                            />
                        </div>
                )
            })}
=======
        <div 
            data-testid="canvas-div"
        >
            {renderMode(props)}       
>>>>>>> Long-branch
        </div>
    );
}

<<<<<<< HEAD
export default Canvas;
=======
export default Canvas;
>>>>>>> Long-branch
