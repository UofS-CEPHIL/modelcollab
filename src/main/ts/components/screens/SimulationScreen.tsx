import { User } from 'firebase/auth';
import React, { FC, useState } from 'react';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar'
import IdGenerator from '../../IdGenerator';


interface Props {
    user: User | null;
}

const SimulationScreen: FC<Props> = (props: Props) => {
    const [mode, setMode] = useState<string>("Move")
    return (
        <React.Fragment>
            <Toolbar mode = {mode} setMode ={setMode}/>

            <Canvas mode = {mode} user={props.user} sessionId={new IdGenerator().generateSessionId().toString()} />

        </React.Fragment>
    );
}

export default SimulationScreen;
