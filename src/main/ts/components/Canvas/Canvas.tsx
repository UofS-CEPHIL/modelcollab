import React, { FC } from 'react';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { UiMode } from './Mode/Mode';
import { ComponentType, FlowFirebaseComponent, StockFirebaseComponent } from '../../data/FirebaseComponentModel';

import { DataContainer } from '../../data/DataContainer';

import MoveMode from './Mode/MoveMode';
import CreateMode from './Mode/CreateMode';
import DeleteMode from './Mode/DeleteMode';
import FlowMode from './Mode/FlowMode';


export const modeFromString = (s: string) => {
    s = s.toUpperCase();
    let out: UiMode | null;
    if (s === "CREATE") out = UiMode.CREATE;
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
                        <MoveMode 
                            data = {data}
                            sessionId = {props.sessionId}
                            firebaseDataModel = {props.firebaseDataModel}
                        />
                    ) 
                case (modeFromString("CREATE")):
                    return(
                        <CreateMode 
                            data = {data}
                            sessionId = {props.sessionId}
                            firebaseDataModel = {props.firebaseDataModel}
                        />    
                    )
                case (modeFromString("DELETE")):
                    return(
                        <DeleteMode 
                            data = {data}
                            sessionId = {props.sessionId}
                            firebaseDataModel = {props.firebaseDataModel}
                        />    
                    )  
                case (modeFromString("FLOW")):
                    return(
                        <FlowMode 
                            data = {data}
                            sessionId = {props.sessionId}
                            firebaseDataModel = {props.firebaseDataModel}
                        />    
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

    props.firebaseDataModel.registerComponentRemovedListener(props.sessionId, (id) => {

        if (id) {
            if (data.getFlows().some(flow => flow.getId() === id)){
                const newFlows = data.getFlows().filter(flow => flow.getId() !== id)
                const newData = data.withFlows(newFlows);
                setData(newData);
            }

            else if (data.getStocks().some(stock => stock.getId() === id)){
                const newStocks = data.getStocks().filter(stock => stock.getId() !== id);
                const newData = data.withStocks(newStocks);
                setData(newData);
            }
        }
    })

    return (
        <div>
            {renderMode(props)}       
        </div>
    );
}

export default Canvas;