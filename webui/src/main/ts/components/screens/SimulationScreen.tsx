import React, { FC, useState, useEffect } from 'react';

import Canvas from '../Canvas/Canvas';
import Toolbar from '../Toolbar/Toolbar'
import IdGenerator from '../../IdGenerator';
import FirebaseDataModelImpl from '../../data/FirebaseDataModelImpl';
import { UiMode } from '../Canvas/Mode/Mode';
import FirebaseManager from '../../FirebaseManager';
import applicationConfig from '../../config/applicationConfig';


interface Props {
    firebaseManager: FirebaseManager;
}

const SimulationScreen: FC<Props> = (props: Props) => {
    const [mode, setMode] = useState<UiMode>(UiMode.MOVE);
    useEffect(() => { document.title = applicationConfig.appName }, []);
    return (
        <React.Fragment>
            <Toolbar mode={mode} setMode={setMode} />
            <Canvas
                firebaseDataModel={new FirebaseDataModelImpl(props.firebaseManager)}
                mode={mode}
                sessionId={new IdGenerator().generateSessionId().toString()}
            />
        </React.Fragment>
    );
}

export default SimulationScreen;
