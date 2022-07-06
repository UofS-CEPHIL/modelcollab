import React, { FC } from "react";
import { DataContainer } from "../../../data/DataContainer";
import FirebaseDataModel from "../../../data/FirebaseDataModel";
import Flow from "../Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR } from "../Stock";

export interface Props {
    data: DataContainer;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}


const DeleteMode: FC<Props> = (props: Props) => {

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {

        if ((event.target as Element).classList.toString() === "Flow-svg"){
            const id = (event.target as Element).id;
            
            props.firebaseDataModel.removeComponent(props.sessionId, id);
        }

        else if (typeof ((event.target as Element).className) === "string" && 
            (event.target as Element).className
            .split(" ")
            .find(item => ["Mui_Stock"].indexOf(item) > -1)
        ) {
            const id = (event.target as Element).id;

            
            props.data.getFlows().filter(flow => flow.getData().from === id || flow.getData().to === id )         
                                 .forEach(flow => {props.firebaseDataModel.removeComponent(props.sessionId, flow.getId())});
                           
            props.firebaseDataModel.removeComponent(props.sessionId, id);    
        }
        
    }

    return (
        <div
            className="draggable_container"
            onDragOver={onDragOver}
            data-testid="createMode-div"
            style={{ "width": "100%", "height": "1000px" }}
            onClick={onClick}
        >
            {props.data.getFlows().map((flow, i) => {
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

            {props.data.getStocks().map((stock, i) => {
                return ( 
                        <div key={i}>
                            <Stock
                                initx={stock.getData().x}
                                inity={stock.getData().y}
                                sessionId={props.sessionId}
                                componentId={stock.getId()}
                                color={DEFAULT_COLOR}
                                draggable={false}
                                text={stock.getData().text}
                                firebaseDataModel={props.firebaseDataModel}
                            />
                        </div>
                )
            })}
        </div>
    )
}

export default DeleteMode;