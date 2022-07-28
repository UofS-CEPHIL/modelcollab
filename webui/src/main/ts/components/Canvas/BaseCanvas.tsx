import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import { FirebaseComponentModel as schema } from "database/build/export";

import FirebaseDataModel from '../../data/FirebaseDataModel';
import ComponentUiData from '../ScreenObjects/ComponentUiData';
import Flow from '../ScreenObjects/Flow';
import Stock, { DEFAULT_COLOR, SELECTED_COLOR } from '../ScreenObjects/Stock';
import Parameter from '../ScreenObjects/Parameter';
import FlowUiData from '../ScreenObjects/FlowUiData';
import StockUiData from '../ScreenObjects/StockUiData';
import ParameterUiData from '../ScreenObjects/ParameterUiData';
import ConnectionUiData from '../ScreenObjects/ConnectionUiData';
import Connection from '../ScreenObjects/Connection';
import Variable from '../ScreenObjects/Variable';
import VariableUiData from '../ScreenObjects/VariableUiData';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    children: ReadonlyArray<ComponentUiData>;
    selectedComponentId: string | null;

    addComponent: (_: ComponentUiData) => void;
    editComponent: (_: ComponentUiData) => void;
    deleteComponent: (id: string) => void;
    setSelected: (id: string | null) => void;
}

export class ComponentNotFoundError extends Error { }


export default abstract class BaseCanvas extends React.Component<Props> {

    protected onCanvasClicked(x: number, y: number): void {
        if (this.props.selectedComponentId) this.props.setSelected(null);
    }

    protected onComponentClicked(comp: ComponentUiData): void {
        this.props.setSelected(comp.getId());
    }

    protected constructor(props: Props) {
        super(props);
    }

    protected getFlows(): FlowUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.FLOW
        ).map(
            (c: ComponentUiData) => c as FlowUiData
        );
    }

    protected getStocks(): StockUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.STOCK
        ).map(
            (c: ComponentUiData) => c as StockUiData
        );
    }

    protected getParams(): ParameterUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.PARAMETER
        ).map(
            (c: ComponentUiData) => c as ParameterUiData
        );
    }

    protected getVariables(): VariableUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() == schema.ComponentType.VARIABLE
        ).map(
            (c: ComponentUiData) => c as VariableUiData
        );
    }

    protected getConnections(): ConnectionUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.CONNECTION
        ).map(
            (c: ComponentUiData) => c as ConnectionUiData
        );
    }

    protected getComponent(id: string): ComponentUiData {
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
                    {
                        this.getFlows().map((flow, i) => {
                            return (
                                <Flow
                                    flowData={flow}
                                    components={this.props.children}
                                    color={this.props.selectedComponentId === flow.getId()
                                        ? SELECTED_COLOR : DEFAULT_COLOR}
                                    key={i}
                                />
                            )
                        })
                    }
                    {
                        this.getStocks().map((stock, i) => {
                            return (
                                <Stock
                                    stock={stock}
                                    color={
                                        this.props.selectedComponentId === stock.getId()
                                            ? SELECTED_COLOR : DEFAULT_COLOR
                                    }
                                    draggable={true}
                                    text={stock.getData().text}
                                    updateState={this.props.editComponent}
                                    key={i}
                                />
                            )
                        })
                    }
                    {
                        this.getParams().map((param, i) => {
                            return (
                                <Parameter
                                    data={param}
                                    draggable={true}
                                    updateState={this.props.editComponent}
                                    color={this.props.selectedComponentId === param.getId()
                                        ? SELECTED_COLOR : DEFAULT_COLOR}
                                    key={i}
                                />
                            )
                        })
                    }
                    {
                        this.getVariables().map((vari, i) => {
                            return (
                                <Variable
                                    data={vari}
                                    draggable={true}
                                    updateState={this.props.editComponent}
                                    color={this.props.selectedComponentId === vari.getId()
                                        ? SELECTED_COLOR : DEFAULT_COLOR}
                                    key={i}
                                />
                            )
                        })
                    }
                    {
                        this.getConnections().map((conn, i) => {
                            return (
                                <Connection
                                    conn={conn}
                                    components={this.props.children}
                                    key={i}
                                />
                            );
                        })
                    }
                </Layer>
            </Stage>
        );
    }
}

