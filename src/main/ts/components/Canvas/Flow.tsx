import React, {FC} from 'react';
import FirebaseDataModel from '../../data/FirebaseDataModel';

export type Point = {
    x: number,
    y: number
}

export interface Props{
    text: string
    from: string,
    to: string,
    equation: string,      
    dependsOn: string[], 
    firebaseDataModel: FirebaseDataModel;
}

const Flow: FC<Props> = (props) => {
    return (<div></div>);
}

export default Flow;