import React, { FC } from "react";
import { DataContainer } from "../../../data/DataContainer";
import { FlowFirebaseComponent } from "../../../data/FirebaseComponentModel";
import FirebaseDataModel from "../../../data/FirebaseDataModel";
import IdGenerator from "../../../IdGenerator";
import Flow from "../Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR, SELECTED_COLOR } from "../Stock";

export interface Props {
    data: DataContainer;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}


const FlowMode: FC<Props> = (props: Props) => {
    const idGenerator = new IdGenerator();
    const [selected, setSelected] = React.useState<string[]>([]);

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {
        if( typeof (event.target as Element).className === "string" && (event.target as Element).className
        .split(" ")
        .find(item => ["Mui_Stock"].indexOf(item) > -1)
        ) {
            if (selected.length === 0 || selected.length > 1){
                setSelected([(event.target as Element).id]);
            }
            else if (selected.length === 1 && !selected.some(id => id === (event.target as Element).id)){
                       
            
                setSelected([...selected,(event.target as Element).id]);
                    
                if (!props.data.getFlows().some(flow => flow.getData().from === selected[0] && flow.getData().to === (event.target as Element).id)){
                    const componentID = idGenerator.generateComponentId(props.data);
                
                    const newFlow = new FlowFirebaseComponent(
                        componentID.toString(),
                        { from: selected[0], to: (event.target as Element).id, text: "", equation: "", dependsOn: [""]}  
                    );
                    props.firebaseDataModel.updateComponent(props.sessionId, newFlow);
                }
            }
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
                     (selected.some(id => id === stock.getId())) 
                        ? <div key={i}>
                            <Stock
                                initx={stock.getData().x}
                                inity={stock.getData().y}
                                sessionId={props.sessionId}
                                componentId={stock.getId()}
                                color={SELECTED_COLOR}
                                draggable={false}
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

export default FlowMode;