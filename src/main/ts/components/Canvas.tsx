import { FC } from 'react';
import Stock from "./Stock";
import IdGenerator from "../IdGenerator";
import { User } from 'firebase/auth';
import FirebaseDataModelImpl from '../data/FirebaseDataModelImpl';

interface Props {
    user: User | null;
    sessionId: string;
}

const Canvas: FC<Props> = (props: Props) => {

    const idGenerator = new IdGenerator();

    return (
        
        <div>
            <Stock
                initx={10}
                inity={10}
                sessionId={props.sessionId}
                componentId={idGenerator.generateComponentId().toString()}
                firebaseDataModel={new FirebaseDataModelImpl()}
            />
        </div>
    );
}

export default Canvas;
