import React, { ReactElement } from 'react';
import { Arrow, Group, Rect } from 'react-konva';
import { Point } from '../../../DrawingUtils';

import ConnectionUiData, { HANDLE_WIDTH } from './ConnectionUiData';
import ComponentUiData from '../ComponentUiData';


export interface Props {
    conn: ConnectionUiData;
    components: ComponentUiData[];
    showHandle: boolean;
    updateState: (c: ConnectionUiData) => void;
}

export default class Connection extends React.Component<Props> {
    public render(): ReactElement {
        const arrowPoints: number[] = this.props.conn.getArrowPoints(this.props.components);
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
                    this.props.showHandle === true && this.makeHandle(   // === true looks stupid but is necessary
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
                fill={"white"}
                stroke={"black"}
                strokeWidth={1}
                name={this.props.conn.getId()}
                draggable
                onDragEnd={onDragEnd}
            />
        );
    }
}
