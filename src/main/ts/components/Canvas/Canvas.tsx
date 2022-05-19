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
    x: number;
    y: number;
    // text: string;
    componentId: string
}

const Canvas: FC<Props> = (props: Props) => {

    const Firebase = new FirebaseDataModelImpl()


    const idGenerator = new IdGenerator();
    let ID: number = 7;
    const [stocks, setStocks] = useState<Stock[]>(
        [
        {x:10,
        y:10,
        componentId:"1"
        },
        {x:10,
        y:10,
        componentId:"5"
        },
        {x:10,
            y:10,
            componentId:"6"
            },
    ]);
    
        const onDragOver: React.DragEventHandler = (event: React.DragEvent) => {
        event.preventDefault();
        if (event.currentTarget.className === "draggable-container") return;
    }

    const onClick: React.MouseEventHandler = (event: React.MouseEvent) => {
            Firebase.newComponents(props.sessionId, (data)=>{
                console.log("new stock",data)
            })
        if (props.mode === "Create"){
            setStocks( [...stocks, {x: event.clientX, y:event.clientY, componentId: `${ID}`}])  
            ID++
        }
    }


    // Firebase.newComponent(props.sessionId, (data)=>{
    //     console.log("new stock",data)
    // })

    // console.log("all components",Firebase.renderComponents(props.sessionId));


    return (
        
        <div className = "draggable_container" onDragOver = {onDragOver} onClick = {onClick}>
            { stocks.map( (stock)=>(
                <Stock
                    initx={stock.x}
                    inity={stock.y} 
                    sessionId={props.sessionId}
                    componentId={stock.componentId}
                    firebaseDataModel={new FirebaseDataModelImpl()}
                />
            ))
            }
        </div>
    );
}

export default Canvas;
