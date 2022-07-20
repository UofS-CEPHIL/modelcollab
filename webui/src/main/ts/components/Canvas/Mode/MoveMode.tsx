import React, { FC } from "react";
import { DataContainer } from "../../../data/DataContainer";
import FirebaseDataModel from "../../../data/FirebaseDataModel";
import Flow from "../Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR, SELECTED_COLOR } from "../Stock";

export interface Props {
    data: DataContainer;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}


const MoveMode: FC<Props> = (props: Props) => {
   
    const [selected, setSelected] = React.useState< string | null>(null);
    
    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

 
    
    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {
        if (typeof ((event.target as Element).className) === "string" 
        && (event.target as Element).className
                                    .split(" ")
                                    .find(item => ["Mui_Stock"].indexOf(item) > -1)) {
            setSelected((event.target as Element).id)
        }
    }

    return (
        <div
            className="draggable_container"
            onDragOver={onDragOver}
            data-testid="moveMode-div"
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
                     (selected && selected === stock.getId()) 
                        ? <div key={i}>
                            <Stock
                                initx={stock.getData().x}
                                inity={stock.getData().y}
                                sessionId={props.sessionId}
                                componentId={stock.getId()}
                                color={SELECTED_COLOR}
                                draggable={true}
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

export default MoveMode;