import React, { FC, useState } from 'react';
import Stock, {DEFAULT_COLOR, SELECTED_COLOR, } from "./Stock";
import IdGenerator from "../../IdGenerator";
import { User } from 'firebase/auth';
import FirebaseDataModelImpl from '../../data/FirebaseDataModelImpl';
import "./Styles.css"

interface Props {
    user: User | null;
    sessionId: string;
    mode: string;

}

interface Stock{
    text: string;
    x: number;
    y: number;
}

interface StockwID{
    stock: Stock
    ID: string
}



const Canvas: FC<Props> = (props: Props) => {

    const Firebase = new FirebaseDataModelImpl()


    const idGenerator = new IdGenerator();


    const [stockswID, setStockswID] = useState<StockwID[]>([]);
    const [selected, setSelected] = useState<string>()

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent ) => {

        if (props.mode === "Create"){
            const componentID = idGenerator.generateComponentId()

            const newStock: Stock =   {text: "",x: event.clientX, y:event.clientY}
            const newStockwID: StockwID =  { stock : {text: "",x: event.clientX, y:event.clientY}, ID: `${componentID}`}

            setStockswID( [...stockswID,newStockwID] )  
            Firebase.updateComponent(props.sessionId, `${componentID}`, newStock);
        }
        else if (props.mode === "Move" && (event.target as Element).classList.item(2)?.localeCompare("Mui_Stock") === 0){
            setSelected((event.target as Element).id)
        }   
        
        else if (props.mode === "Delete"){
            if ((event.target as Element).classList.item(2)?.localeCompare("Mui_Stock") === 0){
                const id: string = (event.target as Element).id
                const index: number = stockswID.findIndex(item => item.ID.localeCompare(id) === 0  )

                let newStockwID: StockwID[] = [...stockswID]
                newStockwID.splice(index,1)
                setStockswID(newStockwID)
                
                Firebase.removeComponent(props.sessionId, (event.target as Element).id)
            }
        }

    }


    Firebase.componentCreatedListener(props.sessionId, (ID, data)=>{
        if (ID){
            let newStock = data as Stock;
            let newStockwID: StockwID = { stock: newStock, ID: `${ID}` }

            if( !stockswID.some(stockwID => stockwID.ID === newStockwID.ID)){
                setStockswID([...stockswID,newStockwID])
            }
        }
    })

    Firebase.componentRemovedListener(props.sessionId)

    return ( 
        <div className = "draggable_container" onDragOver = {onDragOver} onClick = {onClick}>

            { stockswID.map( (stockwID,i)=>(
                
                (selected && stockwID.ID.localeCompare(selected) === 0)
                ?<div key={i}>
                    <Stock
                        initx={stockwID.stock.x}
                        inity={stockwID.stock.y} 
                        sessionId={props.sessionId}
                        componentId={stockwID.ID}
                        color = {SELECTED_COLOR}
                        text = {stockwID.stock.text}
                        firebaseDataModel={new FirebaseDataModelImpl()}
                    />
                </div>
                :<div key={i}>
                    <Stock
                        initx={stockwID.stock.x}
                        inity={stockwID.stock.y} 
                        sessionId={props.sessionId}
                        componentId={stockwID.ID}
                        color = {DEFAULT_COLOR}
                        text = {stockwID.stock.text}
                        firebaseDataModel={new FirebaseDataModelImpl()}
                    />
                </div>
            ))
            }
        </div>
    );
}

export default Canvas;
