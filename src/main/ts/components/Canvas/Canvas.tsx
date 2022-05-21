import React, { FC, useState } from 'react';
import Stock from "./Stock";
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
    
        const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {
        if (props.mode === "Create"){

            const componentID = idGenerator.generateComponentId()

            const newStock: Stock =   {text: "",x: event.clientX, y:event.clientY}
            const newStockwID: StockwID =  { stock : {text: "",x: event.clientX, y:event.clientY}, ID: `${componentID}`}

            setStockswID( [...stockswID,newStockwID] )  
            Firebase.updateComponent(props.sessionId, `${componentID}`, newStock);

        }
    }


    Firebase.newComponents(props.sessionId, (ID, data)=>{
        
        if (ID){

            let newStock = data as Stock;
            let newStockwID: StockwID = { stock: newStock, ID: `${ID}` }

            if( !stockswID.some(stockwID => stockwID.ID === newStockwID.ID)){
                setStockswID([...stockswID,newStockwID])
            }
        }

    })


    // Firebase.renderComponents("1", (data) => {
    //     if (data) {
    //         let newStocks: StockwID[] = [];

    //         for (const [key, value] of Object.entries(data)) {
    //             let stock: StockwID = {stock: {x: value.data.x, y: value.data.y, text: value.data.text}, ID: key}
    //             newStocks.push(stock)
    //         }

    //         if (JSON.stringify(newStocks) !== JSON.stringify(stockswID) )
    //             setStockswID(newStocks)
    //     }
    // })


    return ( 
        <div className = "draggable_container" onDragOver = {onDragOver} onClick = {onClick}>
            { stockswID.map( (stockwID)=>(
                <Stock
                    initx={stockwID.stock.x}
                    inity={stockwID.stock.y} 
                    sessionId={props.sessionId}
                    componentId={stockwID.ID}
                    firebaseDataModel={new FirebaseDataModelImpl()}
                />
            ))
            }
        </div>
    );
}

export default Canvas;
