import React, { FC } from 'react';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { UiMode } from './Mode/UiMode';
import { FirebaseComponentModel as schema } from "database/build/export";

import { DataContainer } from '../../data/DataContainer';

import MoveMode from './Mode/MoveMode';
import StockMode from './Mode/StockMode';
import DeleteMode from './Mode/DeleteMode';
import FlowMode from './Mode/FlowMode';
import EditMode from './Mode/EditMode';

export const modeFromString = (s: string) => {
    s = s.toUpperCase();
    let out: UiMode | null;
    if (s === "STOCK") out = UiMode.STOCK;
    else if (s === "DELETE") out = UiMode.DELETE;
    else if (s === "MOVE") out = UiMode.MOVE;
    else if (s === "FLOW") out = UiMode.FLOW;
    else if (s === "EDIT") out = UiMode.EDIT;
    else out = null;
    return out;
};

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    mode: UiMode;
}


const Canvas: FC<Props> = (props: Props) => {
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
                case (modeFromString("STOCK")):
                    return(
                        <div
                            data-testid="canvas-stockMode-div"
                        >
                            <StockMode 
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
                if (component.getType() === schema.ComponentType.STOCK && !data.getStocks().some(s => s.getId() === component.getId())) {
                    const newStocks = [ ...data.getStocks() , component as schema.StockFirebaseComponent];
                    const newData = data.withStocks(newStocks)
                    
                    setData(newData);
                }
                else if (component.getType() === schema.ComponentType.FLOW && !data.getFlows().some(f => f.getId() === component.getId()) ){
                    const newFlows = [ ...data.getFlows() , component as schema.FlowFirebaseComponent];
                    const newData = data.withFlows(newFlows)

                    setData(newData);
                }
        }    
    })
    

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
        }
    })

    return (
        <div 
            data-testid="canvas-div"
        >
            {renderMode(props)}       
        </div>
    );
}

export default Canvas;