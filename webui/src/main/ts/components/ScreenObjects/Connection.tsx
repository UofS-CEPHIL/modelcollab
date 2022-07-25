import React, { ReactElement } from 'react';
import { Arrow } from 'react-konva';
import ComponentUiData from './ComponentUiData';

import ConnectionUiData from './ConnectionUiData';


export interface Props {
    conn: ConnectionUiData;
    components: ReadonlyArray<ComponentUiData>;
}

export default class Connection extends React.Component<Props> {
    public render(): ReactElement {
        const arrowPoints: number[] = this.props.conn.getArrowPoints(this.props.components);
        return (
            <Arrow
                points={arrowPoints}
                name={this.props.conn.getId()}
                stroke={"blue"}
                fill={"blue"}
            />
        );
    }
}
