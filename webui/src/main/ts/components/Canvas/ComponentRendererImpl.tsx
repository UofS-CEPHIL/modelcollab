import { ReactElement } from "react";

import ComponentRenderer from "./ComponentRenderer";
import Cloud, { Props as CloudProps } from "../ScreenObjects/Cloud";
import { Props as TextProps } from '../ScreenObjects/TextObject';
import Connection, { Props as ConnectionProps } from "../ScreenObjects/Connection";
import Flow, { Props as FlowProps } from '../ScreenObjects/Flow';
import StaticModel, { Props as StaticModelProps } from "../ScreenObjects/StaticModel";
import Stock, { Props as StockProps } from "../ScreenObjects/Stock";
import Parameter from "../ScreenObjects/Parameter";
import SumVariable from "../ScreenObjects/SumVariable";
import DynamicVariable from "../ScreenObjects/DynamicVariable";
import CloudUiData from "../ScreenObjects/CloudUiData";
import StaticModelUiData from "../ScreenObjects/StaticModelUiData";
import { LoadedStaticModel } from "../screens/SimulationScreen";
import ConnectionUiData from "../ScreenObjects/ConnectionUiData";
import ComponentUiData, { TextComponent } from "../ScreenObjects/ComponentUiData";
import DynamicVariableUiData from "../ScreenObjects/DynamicVariableUiData";
import SumVariableUiData from "../ScreenObjects/SumVariableUiData";
import ParameterUiData from "../ScreenObjects/ParameterUiData";
import StockUiData from "../ScreenObjects/StockUiData";
import FlowUiData from "../ScreenObjects/FlowUiData";
import ComponentCollection from "./ComponentCollection";


export default class ComponentRendererImpl implements ComponentRenderer {

    public render(
        components: ComponentCollection,
        getColor: (c: ComponentUiData) => string,
        editComponent: (c: ComponentUiData) => void,
        showConnectionHandles: boolean,
        componentsDraggable: boolean,
        xOffset?: number,
        yOffset?: number
    ): ReactElement[] {
        let shiftedComponents = components;
        if (xOffset && yOffset) {
            shiftedComponents = new ComponentCollection(
                components.getAllComponents().map(c => {
                    if (!c.getData().x || !c.getData().y) {
                        return c;
                    }
                    else {
                        return c.withData({
                            ...c.getData(),
                            x: c.getData().x - xOffset,
                            y: c.getData().y - yOffset
                        });
                    }
                })
            );
        }

        const stocks = this.renderStocks(
            shiftedComponents.getStocks(),
            shiftedComponents.getAllComponents(),
            getColor,
            componentsDraggable,
            editComponent
        );
        const flows = this.renderFlows(
            shiftedComponents.getFlows(),
            shiftedComponents.getAllComponents(),
            getColor
        );
        const clouds = this.renderClouds(
            shiftedComponents.getClouds(),
            editComponent,
            getColor
        );
        const params = this.renderParameters(
            shiftedComponents.getParameters(),
            componentsDraggable,
            editComponent,
            getColor
        );
        const dynVars = this.renderDynamicVariables(
            shiftedComponents.getDynamicVariables(),
            componentsDraggable,
            editComponent,
            getColor
        );
        const sumVars = this.renderSumVariables(
            shiftedComponents.getSumVariables(),
            componentsDraggable,
            editComponent,
            getColor
        );
        const connections = this.renderConnections(
            shiftedComponents.getConnections(),
            components.getAllComponents(),
            editComponent,
            showConnectionHandles
        );
        const models = this.renderStaticModels(
            shiftedComponents.getStaticModels(),
            editComponent
        );

        return stocks
            .concat(flows)
            .concat(params)
            .concat(dynVars)
            .concat(sumVars)
            .concat(connections)
            .concat(models)
            .concat(clouds);
    }

    private renderStock(props: StockProps): ReactElement {
        return (
            <Stock {...props} />
        );
    }

    public renderStocks(
        stocks: StockUiData[],
        components: ComponentUiData[],
        getColor: (c: StockUiData) => string,
        draggable: boolean,
        editComponent: (s: StockUiData) => void
    ): ReactElement[] {
        return stocks.map((stock, i) =>
            this.renderStock({
                stock: stock,
                components,
                color: getColor(stock),
                draggable,
                text: stock.getData().text,
                updateState: editComponent,
                key: i
            } as StockProps)
        );
    }

    private renderFlow(props: FlowProps): ReactElement {
        return (
            <Flow {...props} />
        );
    }

    public renderFlows(
        flows: FlowUiData[],
        components: ComponentUiData[],
        getColor: (f: FlowUiData) => string
    ): ReactElement[] {
        return flows.map((flow, i) =>
            this.renderFlow({
                flowData: flow,
                components,
                color: getColor(flow),
                key: i
            } as FlowProps)
        );
    }

    private renderCloud(props: CloudProps): ReactElement {
        return (
            <Cloud {...props} />
        );
    }

    public renderClouds(
        clouds: CloudUiData[],
        editComponent: (c: CloudUiData) => any,
        getColor: (f: CloudUiData) => string
    ): ReactElement[] {
        return clouds.map((cloud, i) =>
            this.renderCloud({
                data: cloud,
                updateState: editComponent,
                color: getColor(cloud),
                key: i
            } as CloudProps)
        );
    }

    private renderConnection(props: ConnectionProps): ReactElement {
        return (
            <Connection {...props} />
        );
    }

    public renderConnections(
        connections: ConnectionUiData[],
        components: ComponentUiData[],
        editComponent: (c: ConnectionUiData) => void,
        showConnectionHandles: boolean
    ): ReactElement[] {
        return connections.map((conn, i) =>
            this.renderConnection({
                conn,
                components,
                updateState: editComponent,
                showHandle: showConnectionHandles,
                key: i
            } as ConnectionProps)
        );
    }

    private renderParameter(props: TextProps): ReactElement {
        return (
            <Parameter {...props} />
        );
    }

    public renderParameters(
        params: ParameterUiData[],
        draggable: boolean,
        editComponent: (c: ComponentUiData) => void,
        getColor: (c: ParameterUiData) => string
    ): ReactElement[] {
        return params.map((param, i) =>
            this.renderParameter(
                this.makeTextProps(
                    param,
                    draggable,
                    editComponent,
                    getColor(param),
                    i
                )
            )
        );
    }

    private renderSumVariable(props: TextProps): ReactElement {
        return (
            <SumVariable {...props} />
        );
    }

    public renderSumVariables(
        variables: SumVariableUiData[],
        draggable: boolean,
        editComponent: (c: ComponentUiData) => void,
        getColor: (c: SumVariableUiData) => string
    ): ReactElement[] {
        return variables.map((sv, i) =>
            this.renderSumVariable(
                this.makeTextProps(
                    sv,
                    draggable,
                    editComponent,
                    getColor(sv),
                    i
                )
            )
        );
    }

    private renderDynamicVariable(props: TextProps): ReactElement {
        return (
            <DynamicVariable {...props} />
        );
    }

    public renderDynamicVariables(
        variables: DynamicVariableUiData[],
        draggable: boolean,
        editComponent: (c: ComponentUiData) => void,
        getColor: (c: DynamicVariableUiData) => string
    ): ReactElement[] {
        return variables.map((dv, i) =>
            this.renderDynamicVariable(
                this.makeTextProps(
                    dv,
                    draggable,
                    editComponent,
                    getColor(dv),
                    i
                )
            )
        );
    }

    private renderStaticModel(props: StaticModelProps): ReactElement {
        return (
            <StaticModel {...props} />
        );
    }

    public renderStaticModels(
        staticModels: StaticModelUiData[],
        editComponent: (p: ComponentUiData) => void
    ): ReactElement[] {
        return staticModels.map((sm, i) => {
            return this.renderStaticModel({
                model: sm,
                draggable: true,
                updateState: editComponent,
                renderer: this,
                key: i
            } as StaticModelProps);
        });
    }

    private makeTextProps(
        data: TextComponent<any>,
        draggable: boolean,
        editComponent: (c: ComponentUiData) => void,
        color: string,
        i: number
    ): TextProps {
        return {
            data: data,
            draggable,
            updateState: editComponent,
            color,
            key: i
        } as TextProps;
    }
}

