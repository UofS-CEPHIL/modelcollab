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
    const [selected, setSelected] = useState<string | null>(null)

    const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent ) => {

        if (props.mode === "Create"){
            setSelected(null)
            const componentID = idGenerator.generateComponentId()
            const newStock: Stock =   {text: "",x: event.clientX, y:event.clientY}

            // Thinking we might not need these commented-out lines because the Created-Listener will update the useState anyway
            // const newStockwID: StockwID =  { stock : {text: "",x: event.clientX, y:event.clientY}, ID: `${componentID}`}
            // setStockswID( [...stockswID,newStockwID] )  

            Firebase.updateComponent(props.sessionId, `${componentID}`, newStock);
        }
        else if (props.mode === "Move" && (event.target as Element).classList.item(2)?.localeCompare("Mui_Stock") === 0){
            setSelected((event.target as Element).id)
        }   
        
        else if (props.mode === "Delete"){
            setSelected(null)
            if ((event.target as Element).classList.item(2)?.localeCompare("Mui_Stock") === 0){                
                Firebase.removeComponent(props.sessionId, (event.target as Element).id)
            }
        }

    }


    Firebase.componentCreatedListener(props.sessionId, (ID, data)=>{
        if (ID){
            if( !stockswID.some(stockwID => stockwID.ID === ID)){
                let newStock = data as Stock;
                let newStockwID: StockwID = { stock: newStock, ID: `${ID}` }
                setStockswID([...stockswID,newStockwID])
            }
        }
    })

    Firebase.componentRemovedListener(props.sessionId, (ID) => {
        if (ID){
            if( stockswID.some(stockwID => stockwID.ID === ID)){
                const index: number = stockswID.findIndex(item => item.ID === ID )
                let newStockwID: StockwID[] = [...stockswID]
                newStockwID.splice(index,1)
                setStockswID(newStockwID)
            }
        }
    })

    return ( 
        <div className = "draggable_container" onDragOver = {onDragOver} onClick = {onClick}>

            { stockswID.map( (stockwID,i)=>(
                
                (selected && props.mode === "Move" && stockwID.ID === selected)
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
