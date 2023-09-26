import { FirebaseComponentModel as schema } from "database/build/export";
import { Component, RefObject, createRef } from 'react';
import { Cell, EventObject, Graph, InternalEvent, KeyHandler, RubberBandHandler, UndoManager } from '@maxgraph/core';

export interface Props {
    graph: Graph;
    graphRef: HTMLDivElement;
}

export interface State {
    lastCopy: Cell[],
    lastPaste: Cell[],
    allComponents: schema.FirebaseDataComponent<any>[]
}

export default class Canvas extends Component<Props, State> {

    public constructor(props: Props) {
        super(props);
        this.state = { lastCopy: [], lastPaste: [], allComponents: [] };
    }

    public render() {
        return (

        );
    }

    public componentDidMount(): void {
        this.initializeGraph();
    }

}
