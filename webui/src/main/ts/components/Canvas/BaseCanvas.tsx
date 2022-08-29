import React, { ReactElement } from 'react';
import { Stage, Layer } from 'react-konva';
import { FirebaseComponentModel as schema } from "database/build/export";

import FirebaseDataModel from '../../data/FirebaseDataModel';
import ComponentUiData, { TextComponent } from '../ScreenObjects/ComponentUiData';
import { Props as TextProps } from '../ScreenObjects/TextObject';
import Flow, { Props as FlowProps } from '../ScreenObjects/Flow';
import Stock, { DEFAULT_COLOR, SELECTED_COLOR, Props as StockProps } from '../ScreenObjects/Stock';
import Parameter from '../ScreenObjects/Parameter';
import FlowUiData from '../ScreenObjects/FlowUiData';
import StockUiData from '../ScreenObjects/StockUiData';
import ParameterUiData from '../ScreenObjects/ParameterUiData';
import ConnectionUiData from '../ScreenObjects/ConnectionUiData';
import Connection, { Props as ConnectionProps } from '../ScreenObjects/Connection';
import SumVariable from '../ScreenObjects/SumVariable';
import SumVariableUiData from '../ScreenObjects/SumVariableUiData';
import DynamicVariableUiData from '../ScreenObjects/DynamicVariableUiData';
import DynamicVariable from '../ScreenObjects/DynamicVariable';
import CloudUiData from '../ScreenObjects/CloudUiData';
import Cloud, { Props as CloudProps } from '../ScreenObjects/Cloud';

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    children: ReadonlyArray<ComponentUiData>;
    selectedComponentId: string | null;

    addComponent: (_: ComponentUiData) => void;
    editComponent: (_: ComponentUiData) => void;
    deleteComponent: (id: string) => void;
    setSelected: (id: string | null) => void;

    makeStock?: (_: StockProps) => ReactElement;
    makeFlow?: (_: FlowProps) => ReactElement;
    makeParam?: (_: TextProps) => ReactElement;
    makeSumVar?: (_: TextProps) => ReactElement;
    makeDynVar?: (_: TextProps) => ReactElement;
    makeConnection?: (_: ConnectionProps) => ReactElement;
    makeCloud?: (_: CloudProps) => ReactElement;
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

    private renderFlows(): ReactElement[] {
        const makeProps = (flow: FlowUiData, i: number) => {
            return {
                flowData: flow,
                components: this.props.children,
                color:
                    this.props.selectedComponentId === flow.getId()
                        ? SELECTED_COLOR : DEFAULT_COLOR,
                key: i
            } as FlowProps;
        }
        return this.getFlows().map((flow, i) => {
            const props: FlowProps = makeProps(flow, i);
            if (this.props.makeFlow)
                return this.props.makeFlow(props);
            else
                return (
                    <Flow {...props} />
                );
        });
    }

    protected getStocks(): StockUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.STOCK
        ).map(
            (c: ComponentUiData) => c as StockUiData
        );
    }

    private renderStocks(): ReactElement[] {
        const makeProps = (stock: StockUiData, i: number) => {
            return {
                stock: stock,
                components: this.props.children,
                color:
                    this.props.selectedComponentId === stock.getId()
                        ? SELECTED_COLOR : DEFAULT_COLOR,
                draggable: true,
                text: stock.getData().text,
                updateState: this.props.editComponent,
                key: i
            } as StockProps;
        }
        return this.getStocks().map((stock, i) => {
            const props: StockProps = makeProps(stock, i);
            if (this.props.makeStock)
                return this.props.makeStock(props);
            else
                return (
                    <Stock {...props} />
                );
        });
    }

    protected getParams(): ParameterUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.PARAMETER
        ).map(
            (c: ComponentUiData) => c as ParameterUiData
        );
    }

    private renderParams(): ReactElement[] {
        return this.getParams().map((param, i) => {
            const props: TextProps = this.makeTextProps(param, i);
            if (this.props.makeParam)
                return this.props.makeParam(props);
            else
                return (
                    <Parameter {...props} />
                );
        });

    }

    private makeTextProps(data: TextComponent<any>, i: number): TextProps {
        return {
            data: data,
            draggable: true,
            updateState: this.props.editComponent,
            color:
                this.props.selectedComponentId === data.getId()
                    ? SELECTED_COLOR : DEFAULT_COLOR,

            key: i
        } as TextProps;
    }

    protected getSumVariables(): SumVariableUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.SUM_VARIABLE
        ).map(
            (c: ComponentUiData) => c as SumVariableUiData
        );
    }

    private renderSumVariables(): ReactElement[] {
        return this.getSumVariables().map((sv, i) => {
            const props = this.makeTextProps(sv, i);
            if (this.props.makeSumVar)
                return this.props.makeSumVar(props);
            else
                return (
                    <SumVariable {...props} />
                )
        });
    }

    protected getDynamicVariables(): DynamicVariableUiData[] {
        return this.props.children
            .filter((c: ComponentUiData) => c.getType() === schema.ComponentType.VARIABLE)
            .map((c: ComponentUiData) => c as DynamicVariableUiData)
    }

    private renderDynamicVariables(): ReactElement[] {
        return this.getDynamicVariables().map((dv, i) => {
            const props: TextProps = this.makeTextProps(dv, i);
            if (this.props.makeDynVar)
                return this.props.makeDynVar(props);
            return (
                <DynamicVariable {...props} />
            );
        });
    }

    protected getConnections(): ConnectionUiData[] {
        return this.props.children.filter(
            (c: ComponentUiData) => c.getType() === schema.ComponentType.CONNECTION
        ).map(
            (c: ComponentUiData) => c as ConnectionUiData
        );
    }

    private renderConnections(): ReactElement[] {
        const makeProps = (conn: ConnectionUiData, i: number) => {
            return {
                conn,
                components: this.props.children,
                updateState: this.props.editComponent,
                showHandle: this.shouldShowConnectionHandles,
                key: i
            } as ConnectionProps;
        }
        return this.getConnections().map((conn, i) => {
            const props = makeProps(conn, i);
            if (this.props.makeConnection)
                return this.props.makeConnection(props);
            else
                return (
                    <Connection {...props} />
                );
        });
    }

    protected getClouds(): CloudUiData[] {
        return this.props.children
            .filter(c => c.getType() === schema.ComponentType.CLOUD)
            .map((c: ComponentUiData) => c as CloudUiData)
    }

    private renderClouds(): ReactElement[] {
        const makeProps = (cloud: CloudUiData, i: number) => {
            return {
                data: cloud,
                updateState: this.props.editComponent,
                color:
                    this.props.selectedComponentId === cloud.getId()
                        ? SELECTED_COLOR : DEFAULT_COLOR,
                key: i
            } as CloudProps;
        };
        return this.getClouds().map((cloud, i) => {
            const props = makeProps(cloud, i);
            if (this.props.makeCloud)
                return this.props.makeCloud(props);
            else
                return (
                    <Cloud {...props} />
                );
        });
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
                    {this.renderFlows()}
                    {this.renderStocks()}
                    {this.renderParams()}
                    {this.renderSumVariables()}
                    {this.renderDynamicVariables()}
                    {this.renderConnections()}
                    {this.renderClouds()}
                </Layer>
            </Stage>
        );
    }
}

