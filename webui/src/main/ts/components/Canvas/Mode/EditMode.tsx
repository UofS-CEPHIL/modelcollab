import React, { FC } from "react";
import { DataContainer } from "../../../data/DataContainer";
import FirebaseDataModel from "../../../data/FirebaseDataModel";
import Flow from "../Flow";
import "./Styles.css"
import Stock, { DEFAULT_COLOR, SELECTED_COLOR } from "../Stock";
import EditBox from "../EditBox";
import { FirebaseComponentModel as schema } from "../../../../../../../database/build/export";

export interface Props {
    data: DataContainer;
    sessionId: string;
    firebaseDataModel: FirebaseDataModel;
}


const EditMode: FC<Props> = (props: Props) => {

    const [selected, setSelected] = React.useState<schema.FirebaseDataComponent | null>(null);
    const [open, setOpen] = React.useState<boolean>(false)

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {
        if ((event.target as Element).classList.toString() === "Flow-svg") {
            const flow = props.data.getFlows().find(flow => flow.getId() === (event.target as Element).id);
            if (flow) {
                setSelected(flow);
                setOpen(true)
            }
        }
        else if (typeof ((event.target as Element).className) === "string"
            && (event.target as Element).className.split(" ").find(item => ["Mui_Stock"].indexOf(item) > -1)) {
            const stock = props.data.getStocks().find(stock => stock.getId() === (event.target as Element).id);
            if (stock) {
                setSelected(stock);
                setOpen(true);
            }
        }
    }


    return (
        <div
            className="draggable_container"
            onDragOver={onDragOver}
            data-testid="editMode-div"
            style={{ "width": "100%", "height": "1000px" }}
            onClick={onClick}
        >
            {props.data.getFlows().map((flow, i) => {
                return (
                    <div key={i}>
                        <Flow
                            componentId={flow.getId()}
                            sessionId={props.sessionId}
                            text={flow.getData().text}
                            from={flow.getData().from}
                            to={flow.getData().to}
                            equation={flow.getData().equation}
                            dependsOn={flow.getData().dependsOn}
                            firebaseDataModel={props.firebaseDataModel}
                        />
                    </div>
                )
            })}

            {props.data.getStocks().map((stock, i) => {
                return (
                    (selected && selected.getId() === stock.getId())
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
            {(open && selected)
                && <EditBox
                    setOpen={setOpen}
                    open={open}
                    component={selected}
                    sessionId={props.sessionId}
                    firebaseDataModel={props.firebaseDataModel}
                />}
        </div>
    )
}

export default EditMode;
