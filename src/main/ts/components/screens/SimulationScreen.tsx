import React, { FC, useState } from 'react';

import { User } from 'firebase/auth';
import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar'
import IdGenerator from '../../IdGenerator';
import FirebaseDataModelImpl from '../../data/FirebaseDataModelImpl';
import { UiMode } from '../Canvas/Mode';


interface Props {
    user: User | null;
}

const SimulationScreen: FC<Props> = (props: Props) => {
    const [mode, setMode] = useState<UiMode>(UiMode.MOVE)
    return (
        <React.Fragment>
            <Toolbar mode={mode} setMode={setMode} />
            <Canvas
                firebaseDataModel={new FirebaseDataModelImpl()}
                mode={mode}
                user={props.user}
                sessionId={new IdGenerator().generateSessionId().toString()}
            />

        </React.Fragment>
    );
}

export default SimulationScreen;
