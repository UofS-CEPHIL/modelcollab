import React, { FC, useState } from 'react';

import Stock, { DEFAULT_COLOR, SELECTED_COLOR, } from "./Stock";
import IdGenerator from "../../IdGenerator";
import { User } from 'firebase/auth';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import "./Styles.css"

export const enum Mode {
    CREATE = "Create",
    DELETE = "Delete",
    MOVE = "Move"
}

export const modeFromString = (s: string) => {
    s = s.toUpperCase();
    let out: Mode | null;
    if (s === "CREATE") out = Mode.CREATE;
    else if (s === "DELETE") out = Mode.DELETE;
    else if (s === "MOVE") out = Mode.MOVE;
    else out = null;
    return out;
};

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    user: User | null;
    sessionId: string;
    mode: Mode;
}

interface Stock {
    text: string;
    x: number;
    y: number;
}

interface StockwID {
    stock: Stock
    id: string
}


const Canvas: FC<Props> = (props: Props) => {

    const idGenerator = new IdGenerator();

    const [stockswID, setStockswID] = React.useState<StockwID[]>([]);
    const [selected, setSelected] = useState<string | null>(null);

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {
        if (props.mode === Mode.CREATE) {
            setSelected(null);
            const componentID = idGenerator.generateComponentId();
            const newStock: Stock = { text: "", x: event.clientX, y: event.clientY };
            props.firebaseDataModel.updateComponent(props.sessionId, `${componentID}`, newStock);
        }
        else if (props.mode === Mode.MOVE
            && (event.target as Element).className
                .split(" ")
                .find(item => ["Mui_Stock"].indexOf(item) > -1)
        ) {
            setSelected((event.target as Element).id);
        }

        else if (props.mode === Mode.DELETE) {
            setSelected(null);
            if ((event.target as Element).className
                .split(" ")
                .find(item => ["Mui_Stock"].indexOf(item) > -1)
            ) {
                props.firebaseDataModel.removeComponent(props.sessionId, (event.target as Element).id);
            }
        }
    }

    props.firebaseDataModel.registerComponentCreatedListener(props.sessionId, (id, data) => {
        if (id) {
            if (!stockswID.some(stockwID => stockwID.id === id)) {
                let newStock = data as Stock;
                let newStockwID: StockwID = { stock: newStock, id: `${id}` };
                setStockswID([...stockswID, newStockwID]);
            }
        }
    })

    props.firebaseDataModel.registerComponentRemovedListener(props.sessionId, (id) => {
        if (id) {
            if (stockswID.some(stockwID => stockwID.id === id)) {
                const index: number = stockswID.findIndex(item => item.id === id);
                let newStockwID: StockwID[] = [...stockswID];
                newStockwID.splice(index, 1);
                setStockswID(newStockwID);
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

            {stockswID.map((stockwID, i) => (

                (selected && props.mode === Mode.MOVE && stockwID.id === selected)
                    ? <div key={i}>
                        <Stock
                            initx={stockwID.stock.x}
                            inity={stockwID.stock.y}
                            sessionId={props.sessionId}
                            componentId={stockwID.id}
                            color={SELECTED_COLOR}
                            text={stockwID.stock.text}
                            firebaseDataModel={props.firebaseDataModel}
                        />
                    </div>
                    : <div key={i}>
                        <Stock
                            initx={stockwID.stock.x}
                            inity={stockwID.stock.y}
                            sessionId={props.sessionId}
                            componentId={stockwID.id}
                            color={DEFAULT_COLOR}
                            text={stockwID.stock.text}
                            firebaseDataModel={props.firebaseDataModel}
                        />
                    </div>
            ))}
        </div>
    );
}

export default Canvas;
