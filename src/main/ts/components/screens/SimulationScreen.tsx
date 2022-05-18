import { User } from 'firebase/auth';
import { FC } from 'react';
import Canvas from '../Canvas';
import IdGenerator from '../../IdGenerator';

interface Props {
    user: User | null;
}

const SimulationScreen: FC<Props> = (props: Props) => {
    return (
        <Canvas user={props.user} sessionId={new IdGenerator().generateSessionId().toString()} />
    );
}

export default SimulationScreen;
