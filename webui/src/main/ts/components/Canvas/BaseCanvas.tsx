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
import SumVariable from '../ScreenObjects/SumVariable';
import SumVariableUiData from '../ScreenObjects/SumVariableUiData';
import DynamicVariableUiData from '../ScreenObjects/DynamicVariableUiData';
import DynamicVariable from '../ScreenObjects/DynamicVariable';
import CloudUiData from '../ScreenObjects/CloudUiData';
import Cloud from '../ScreenObjects/Cloud';

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

    private readonly shouldShowConnectionHandles: boolean;

    protected constructor(props: Props, shouldShowConnectionHandles?: boolean) {
        super(props);
        this.shouldShowConnectionHandles = shouldShowConnectionHandles || false;
    }

    protected onCanvasClicked(x: number, y: number): void {
        if (this.props.selectedComponentId) this.props.setSelected(null);
    }

    protected onComponentClicked(comp: ComponentUiData): void {
        this.props.setSelected(comp.getId());
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

    protected getSumVariables(): SumVariableUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.SUM_VARIABLE
        ).map(
            (c: ComponentUiData) => c as SumVariableUiData
        );
    }

    protected getDynamicVariables(): DynamicVariableUiData[] {
        return this.props.children
            .filter((c: ComponentUiData) => c.getType() === schema.ComponentType.VARIABLE)
            .map((c: ComponentUiData) => c as DynamicVariableUiData)
    }

    protected getConnections(): ConnectionUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.CONNECTION
        ).map(
            (c: ComponentUiData) => c as ConnectionUiData
        );
    }

    protected getClouds(): CloudUiData[] {
        return this.props.children
            .filter(c => c.getType() === schema.ComponentType.CLOUD)
            .map((c: ComponentUiData) => c as CloudUiData)
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
                height={15000}
                data-testid={"CanvasStage"}
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
                        this.getSumVariables().map((sv, i) => {
                            return (
                                <SumVariable
                                    data={sv}
                                    draggable={true}
                                    updateState={this.props.editComponent}
                                    color={this.props.selectedComponentId === sv.getId()
                                        ? SELECTED_COLOR : DEFAULT_COLOR}
                                    key={i}
                                />
                            )
                        })
                    }
                    {
                        this.getDynamicVariables().map((dv, i) => {
                            return (
                                <DynamicVariable
                                    data={dv}
                                    draggable={true}
                                    updateState={this.props.editComponent}
                                    color={this.props.selectedComponentId === dv.getId()
                                        ? SELECTED_COLOR : DEFAULT_COLOR}
                                    key={i}
                                />
                            );
                        })
                    }
                    {
                        this.getConnections().map((conn, i) => {
                            return (
                                <Connection
                                    conn={conn}
                                    components={this.props.children}
                                    updateState={this.props.editComponent}
                                    showHandle={this.shouldShowConnectionHandles}
                                    key={i}
                                />
                            );
                        })
                    }
                    {
                        this.getClouds().map((cloud, i) => {
                            return (
                                <Cloud
                                    data={cloud}
                                    updateState={this.props.editComponent}
                                    color={this.props.selectedComponentId === cloud.getId()
                                        ? SELECTED_COLOR : DEFAULT_COLOR}
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

