import React, { FC, useState } from 'react';

import Stock, { DEFAULT_COLOR, SELECTED_COLOR, } from "./Stock";
import IdGenerator from "../../IdGenerator";
import { User } from 'firebase/auth';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import "./Styles.css"
import { UiMode } from './Mode';
import { StockFirebaseComponent } from '../../data/FirebaseComponentModel';


export const modeFromString = (s: string) => {
    s = s.toUpperCase();
    let out: UiMode | null;
    if (s === "CREATE") out = UiMode.CREATE;
    else if (s === "DELETE") out = UiMode.DELETE;
    else if (s === "MOVE") out = UiMode.MOVE;
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
                props.firebaseDataModel.removeComponent(props.sessionId, (event.target as Element).id);
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
            setStocks(stocks.filter(stock => stock.getId() != id));
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
        </div>
    );
}

export default Canvas;
