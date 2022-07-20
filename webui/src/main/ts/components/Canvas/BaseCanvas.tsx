import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { FirebaseComponentModel as schema } from "database/build/export";


export interface Point {
    x: number;
    y: number;
}

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    children: ReadonlyArray<schema.FirebaseDataComponent>;
    selectedComponentId: string | null;

    addComponent: (_: schema.FirebaseDataComponent) => void;
    editComponent: (_: schema.FirebaseDataComponent) => void;
    deleteComponent: (id: string) => void;
    setSelected: (id: string | null) => void;
}

export class ComponentNotFoundError extends Error { }


export default abstract class BaseCanvas extends React.Component<Props> {

    // Must return a Konva node. Couldn't make the imports work that way.
    protected abstract renderChildren(): ReactElement;


    protected onCanvasClicked(x: number, y: number): void { }
    protected onComponentClicked(comp: schema.FirebaseDataComponent): void { }

    protected constructor(props: Props) {
        super(props);
    }

    protected getFlows(): schema.FlowFirebaseComponent[] {
        return this.props.children.filter(
            (c: schema.FirebaseDataComponent) => c.getType() == schema.ComponentType.FLOW
        ).map(
            (c: schema.FirebaseDataComponent) => c as schema.FlowFirebaseComponent
        );
    }

    protected getStocks(): schema.StockFirebaseComponent[] {
        return this.props.children.filter(
            (c: schema.FirebaseDataComponent) => c.getType() == schema.ComponentType.STOCK
        ).map(
            (c: schema.FirebaseDataComponent) => c as schema.StockFirebaseComponent
        );
    }

    protected getComponent(id: string): schema.FirebaseDataComponent {
        const cpt = this.props.children.find(c => c.getId() === id);
        if (!cpt) throw new ComponentNotFoundError();
        return cpt;
    }

    public render(): ReactElement {
        const onClick = (event: any) => {
            const target = this.props.children.find(c => c.getId() === event.target.attrs.name);
            const pointerPos = event.currentTarget.getPointerPosition();
            target
                ? this.onComponentClicked(target)
                : this.onCanvasClicked(pointerPos.x, pointerPos.y);
        }
        return (
            <Stage
                width={window.innerWidth}
                height={window.innerHeight}
                onClick={onClick}
            >
                <Layer>
                    {this.renderChildren()}
                </Layer>
            </Stage>
        );
    }
}

