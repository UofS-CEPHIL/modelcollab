import React, { ReactElement } from 'react';
import { Stage, Layer, Group } from 'react-konva';
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

const RIGHT_CLICK = 2;
export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    children: ReadonlyArray<ComponentUiData>;
    selectedComponentIds: string[];
    showConnectionHandles: boolean;

    addComponent: (_: ComponentUiData) => void;
    editComponent: (_: ComponentUiData) => void;
    deleteComponent: (id: string) => void;
    setSelected: (ids: string[]) => void;

    // visible for testing
    // TODO make these non-optional and send them up by 1 layer
    makeStock?: (_: StockProps) => ReactElement;
    makeFlow?: (_: FlowProps) => ReactElement;
    makeParam?: (_: TextProps) => ReactElement;
    makeSumVar?: (_: TextProps) => ReactElement;
    makeDynVar?: (_: TextProps) => ReactElement;
    makeConnection?: (_: ConnectionProps) => ReactElement;
    makeCloud?: (_: CloudProps) => ReactElement;
    registerComponentClickedHandler?: (callback: ((c: ComponentUiData) => void)) => void;
    registerCanvasLeftClickedHandler?: (callback: ((x: number, y: number) => void)) => void;
    registerCanvasRightClickedHandler?: (callback: ((x: number, y: number) => void)) => void;
}

export interface State {

}

export class ComponentNotFoundError extends Error { }


export abstract class ExtendableBaseCanvas
    <CanvasProps extends Props, CanvasState extends State>
    extends React.Component<CanvasProps, CanvasState>
{

    protected constructor(props: CanvasProps) {
        super(props);
    }

    protected onCanvasLeftClicked(x: number, y: number): void {
        this.setNoneSelected();
    }

    protected onCanvasRightClicked(x: number, y: number): void {
        this.setNoneSelected();
    }

    protected setNoneSelected(): void {
        this.props.setSelected([]);
    }

    protected onComponentClicked(comp: ComponentUiData): void {
        this.props.setSelected([comp.getId()]);
    }

    protected renderModeSpecificLayer(): ReactElement {
        return (<Group />);
    }

    protected onCanvasMouseDown(x: number, y: number): void { }

    protected onCanvasMouseUp(x: number, y: number): void { }

    protected onCanvasMouseMoved(x: number, y: number): void { }

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
                color: this.getComponentColour(flow),
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
                color: this.getComponentColour(stock),
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
            color: this.getComponentColour(data),
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
                showHandle: this.props.showConnectionHandles,
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
                color: this.getComponentColour(cloud),
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
        this.registerArtificialClickListeners(); // for testing

        return (
            <Stage
                width={window.innerWidth}
                height={15000}
                data-testid={"CanvasStage"}
                onClick={e => this.onClick(e)}
                onMouseDown={e => this.onMouseDown(e)}
                onMouseUp={e => this.onMouseUp(e)}
                onMouseMove={e => this.onMouseMove(e)}
                onContextMenu={e => {
                    e.evt.preventDefault();
                }}

            >
                <Layer>
                    {this.renderFlows()}
                    {this.renderStocks()}
                    {this.renderParams()}
                    {this.renderSumVariables()}
                    {this.renderDynamicVariables()}
                    {this.renderConnections()}
                    {this.renderClouds()}
                    {this.renderModeSpecificLayer()}
                </Layer>
            </Stage>
        );
    }

    private onClick(event: any): void {
        const target = this.props.children.find(c => c.getId() === event.target.attrs.name);
        const pointerPos = event.currentTarget.getPointerPosition();

        const isRightClick = event.evt.button === RIGHT_CLICK;
        if (target) {
            this.onComponentClicked(target)
        }
        else if (isRightClick) {
            this.onCanvasRightClicked(pointerPos.x, pointerPos.y);
        }
        else {
            this.onCanvasLeftClicked(pointerPos.x, pointerPos.y);
        }
    }

    private onMouseDown(event: any): void {
        const target = this.props.children.find(c => c.getId() === event.target.attrs.name);
        const pointerPos = event.currentTarget.getPointerPosition();

        if (!target) {
            this.onCanvasMouseDown(pointerPos.x, pointerPos.y);
        }
    }

    private onMouseUp(event: any): void {
        const pointerPos = event.currentTarget.getPointerPosition();
        this.onCanvasMouseUp(pointerPos.x, pointerPos.y);
    }

    private onMouseMove(event: any): void {
        const pointerPos = event.currentTarget.getPointerPosition();
        this.onCanvasMouseMoved(pointerPos.x, pointerPos.y);
    }

    private registerArtificialClickListeners(): void {
        if (this.props.registerCanvasLeftClickedHandler)
            this.props.registerCanvasLeftClickedHandler((x, y) => this.onCanvasLeftClicked(x, y));
        if (this.props.registerCanvasRightClickedHandler)
            this.props.registerCanvasRightClickedHandler((x, y) => this.onCanvasRightClicked(x, y));
        if (this.props.registerComponentClickedHandler)
            this.props.registerComponentClickedHandler(c => this.onComponentClicked(c));
    }

    private getComponentColour(component: ComponentUiData): string {
        return this.props.selectedComponentIds.includes(component.getId())
            ? SELECTED_COLOR : DEFAULT_COLOR;
    }
}

export default abstract class BaseCanvas extends ExtendableBaseCanvas<Props, State> { }

