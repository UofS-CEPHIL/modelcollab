import React, { ReactElement } from 'react';
import { Arrow, Group, Rect } from 'react-konva';
import { Point } from '../DrawingUtils';
import ComponentUiData from './ComponentUiData';

import ConnectionUiData, { HANDLE_WIDTH } from './ConnectionUiData';


export interface Props {
    conn: ConnectionUiData;
    components: ReadonlyArray<ComponentUiData>;
    updateState: (c: ConnectionUiData) => void;
}

export default class Connection extends React.Component<Props> {
    public render(): ReactElement {
        const arrowPoints: number[] = this.props.conn.getArrowPoints(this.props.components);
        console.log(`arrowpoints = ${arrowPoints}`)
        return (
            <Group>
                <Arrow
                    points={arrowPoints}
                    name={this.props.conn.getId()}
                    stroke={"blue"}
                    fill={"blue"}
                    tension={0.5}
                />
                {
                    this.makeHandle(
                        this.props.conn.computeHandleLocation(this.props.components)
                    )
                }
            </Group>
        );
    }


    private makeHandle(position: Point): ReactElement {
        const centrePoint = this.props.conn.getCentrePoint(this.props.components);
        const onDragEnd = (event: any) => {
            const pos = { handleXOffset: event.target.x() - centrePoint.x, handleYOffset: event.target.y() - centrePoint.y };
            const newComponent = this.props.conn.withData(
                { ...this.props.conn.getData(), ...pos }
            );
            this.props.updateState(newComponent);
        };
        return (
            <Rect
                x={position.x}
                y={position.y}
                width={HANDLE_WIDTH}
                height={HANDLE_WIDTH}
                fill={"gray"}
                stroke={"black"}
                strokeWidth={2}
                name={this.props.conn.getId()}
                draggable
                onDragEnd={onDragEnd}
            />
        );
    }
}
