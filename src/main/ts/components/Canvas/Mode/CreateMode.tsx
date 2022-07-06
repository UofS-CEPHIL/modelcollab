import React, { FC } from "react";
import { DataContainer } from "../../../data/DataContainer";
import { StockFirebaseComponent } from "../../../data/FirebaseComponentModel";
import FirebaseDataModel from "../../../data/FirebaseDataModel";
import IdGenerator from "../../../IdGenerator";
import Flow from "../Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR } from "../Stock";

export interface Props {
    data: DataContainer;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}


const CreateMode: FC<Props> = (props: Props) => {
    const idGenerator = new IdGenerator();

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {

        const componentID = idGenerator.generateComponentId(props.data);
        

        const newStock = new StockFirebaseComponent(
            componentID.toString(),
            { text: "", x: event.clientX, y: event.clientY, initvalue: "" }
        );
        props.firebaseDataModel.updateComponent(props.sessionId, newStock);
        
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

export default CreateMode;