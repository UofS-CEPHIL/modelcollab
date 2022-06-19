import React, { FC } from 'react';

import Stock, { DEFAULT_COLOR, SELECTED_COLOR, } from "./Stock";
import IdGenerator from "../../IdGenerator";
import { User } from 'firebase/auth';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import "./Styles.css"
import { UiMode } from './Mode';
import { ComponentType, FlowFirebaseComponent, StockFirebaseComponent } from '../../data/FirebaseComponentModel';
import Flow from './Flow';


export const modeFromString = (s: string) => {
    s = s.toUpperCase();
    let out: UiMode | null;
    if (s === "CREATE") out = UiMode.CREATE;
    else if (s === "DELETE") out = UiMode.DELETE;
    else if (s === "MOVE") out = UiMode.MOVE;
    else if (s === "FLOW") out = UiMode.FLOW;
    else out = null;
    return out;
};

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    user: User | null;
    sessionId: string;
    mode: UiMode;
}


const Canvas: FC<Props> = (props: Props) => {

    const idGenerator = new IdGenerator();

    const [stocks, setStocks] = React.useState<StockFirebaseComponent[]>([]);
    const [selected, setSelected] = React.useState< string | null>(null);

    const [selectedStocks, setSelectedStocks] = React.useState< string[]>([]);
    
    const [flows, setFlows] = React.useState<FlowFirebaseComponent[]>([]);

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {
        if (props.mode === UiMode.CREATE) {
            setSelected(null);

            setSelectedStocks([]);

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
            setSelectedStocks([]);
            setSelected((event.target as Element).id)
        }

        else if (props.mode === UiMode.DELETE) {
            setSelected(null);
            setSelectedStocks([]);

            if (((event.target as Element).classList.toString() === "Flow-svg")
              ||(event.target as Element).className
                .split(" ")
                .find(item => ["Mui_Stock"].indexOf(item) > -1)
            ) {
                const id = (event.target as Element).id;
                props.firebaseDataModel.removeComponent(props.sessionId, id);
            }
            
        }

        else if (props.mode === UiMode.FLOW){
            
            if( (event.target as Element).className
            .split(" ")
            .find(item => ["Mui_Stock"].indexOf(item) > -1)
            ) {
            
                let newTuple: string[] = selectedStocks;
                setSelected(null);

                if (selectedStocks.length === 0){
                    newTuple[0] = (event.target as Element).id;
                    setSelectedStocks(newTuple);
                }

                else if (selectedStocks.length === 1){
                    newTuple[1] = (event.target as Element).id;
                    setSelectedStocks(newTuple);

                    const componentID = idGenerator.generateComponentId();
                    const newFlow = new FlowFirebaseComponent(
                        componentID.toString(),
                        { text: "", from: selectedStocks[0], to: selectedStocks[1], equation: "", dependsOn: []}
                    );
                    props.firebaseDataModel.updateComponent(props.sessionId, newFlow);
                }

                else{
                    newTuple = [];
                    newTuple[0] = (event.target as Element).id;
                    setSelectedStocks(newTuple);
                }
            }
        }
    }

    

    props.firebaseDataModel.registerComponentCreatedListener(props.sessionId, (component) => {
        if (component) {
                if (component.getType() === ComponentType.STOCK && !stocks.some(s => s.getId() === component.getId())) {
                    setStocks([...stocks, component as StockFirebaseComponent]);
                }
                else if (component.getType() === ComponentType.FLOW && !flows.some(s => s.getId() === component.getId()) ){
                    setFlows([...flows, component as FlowFirebaseComponent]);
                }
        }    
    })

    props.firebaseDataModel.registerComponentRemovedListener(props.sessionId, (id) => {
        if (id) {
            let found = false;
            setStocks(stocks.filter(stock => found = stock.getId() !== id));

            if (!found){
                setFlows(flows.filter(flow => flow.getId() !== id));
            }
        }
    })

    return (
        <div
            className="draggable_container"
            onDragOver={onDragOver}
            onClick={onClick}
            data-testid="canvas-div"
            style={{ "width": "100%", "height": "1000px" }}
        >
            {flows.map((flow, i) => {
                return (
                    <div key={i}>
                        <Flow
                                componentId = {flow.getId()}
                                sessionId = {props.sessionId}
                                text = {flow.getData().text}
                                from = {flow.getData().from}
                                to = {flow.getData().to}
                                equation = {flow.getData().equation}      
                                dependsOn = {flow.getData().dependsOn} 
                                firebaseDataModel = {props.firebaseDataModel}
                            />
                    </div>
                )
            })} 
            
            {stocks.map((stock, i) => {
                return (
                    ( (selected && props.mode === UiMode.MOVE && selected === stock.getId()) 
                       || (props.mode === UiMode.FLOW && selectedStocks.some(id => id === stock.getId())) )
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
 

        </div>
    );
}

export default Canvas;
