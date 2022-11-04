import { ReactElement } from "react";

import ComponentRenderer from "./ComponentRenderer";
import Cloud, { Props as CloudProps } from "../ScreenObjects/Cloud/Cloud";
import { Props as TextProps } from '../ScreenObjects/TextObject';
import Connection, { Props as ConnectionProps } from "../ScreenObjects/Connection/Connection";
import Flow, { Props as FlowProps } from '../ScreenObjects/Flow/Flow';
import StaticModel, { Props as StaticModelProps } from "../ScreenObjects/StaticModel/StaticModel";
import Stock, { Props as StockProps } from "../ScreenObjects/Stock/Stock";
import Parameter from "../ScreenObjects/Parameter/Parameter";
import SumVariable from "../ScreenObjects/SumVariable/SumVariable";
import DynamicVariable from "../ScreenObjects/DynamicVariable/DynamicVariable";
import CloudUiData from "../ScreenObjects/Cloud/CloudUiData";
import StaticModelUiData from "../ScreenObjects/StaticModel/StaticModelUiData";
import ConnectionUiData from "../ScreenObjects/Connection/ConnectionUiData";
import ComponentUiData, { TextComponent } from "../ScreenObjects/ComponentUiData";
import DynamicVariableUiData from "../ScreenObjects/DynamicVariable/DynamicVariableUiData";
import SumVariableUiData from "../ScreenObjects/SumVariable/SumVariableUiData";
import ParameterUiData from "../ScreenObjects/Parameter/ParameterUiData";
import StockUiData from "../ScreenObjects/Stock/StockUiData";
import FlowUiData from "../ScreenObjects/Flow/FlowUiData";
import ComponentCollection from "../ComponentCollection";


export default class ComponentRendererImpl implements ComponentRenderer {

    private componentKey: number = 0;
    private static readonly MAX_COMPONENT_KEY = Number.MAX_VALUE - 100000;

    public render(
        components: ComponentCollection,
        auxiliaryComponents: ComponentCollection | null,
        getColor: (c: ComponentUiData) => string,
        editComponent: (c: ComponentUiData) => void,
        showConnectionHandles: boolean,
        componentsDraggable: boolean,
    ): ReactElement[] {
        if (this.componentKey > ComponentRendererImpl.MAX_COMPONENT_KEY) {
            this.componentKey = 0;
        }

        components = components.withSubstitutionsApplied();
        const renderedStaticModelComponents = components.getStaticModels()
            .map(sm => sm.getComponentsRelativeToSelf())
            .reduce((a, b) => a.concat(b), []);
        components = new ComponentCollection(
            components.getAllComponentsWithoutChildren()
                .filter(
                    c => renderedStaticModelComponents.find(c2 => c2.getId() === c.getId()) === undefined
                )
        );

        const models = this.renderStaticModels(
            components.getStaticModels(),
            components,
            editComponent,
            getColor
        );
        const stocks = this.renderStocks(
            components.getStocks(),
            components.getAllComponentsIncludingChildren(),
            getColor,
            componentsDraggable,
            editComponent
        );
        const flows = this.renderFlows(
            components.getFlows(),
            components.getAllComponentsIncludingChildren()
                .concat(auxiliaryComponents?.getAllComponentsIncludingChildren() || []),
            getColor
        );
        const clouds = this.renderClouds(
            components.getClouds(),
            editComponent,
            getColor
        );
        const params = this.renderParameters(
            components.getParameters(),
            componentsDraggable,
            editComponent,
            getColor
        );
        const dynVars = this.renderDynamicVariables(
            components.getDynamicVariables(),
            componentsDraggable,
            editComponent,
            getColor
        );
        const sumVars = this.renderSumVariables(
            components.getSumVariables(),
            componentsDraggable,
            editComponent,
            getColor
        );
        const connections = this.renderConnections(
            components.getConnections(),
            components.getAllComponentsIncludingChildren()
                .concat(auxiliaryComponents?.getAllComponentsIncludingChildren() || []),
            editComponent,
            showConnectionHandles
        );

        return flows
            .concat(stocks)
            .concat(models)
            .concat(clouds)
            .concat(params)
            .concat(dynVars)
            .concat(sumVars)
            .concat(connections);
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
        return stocks.map((stock) =>
            this.renderStock({
                stock: stock,
                components,
                color: getColor(stock),
                draggable,
                text: stock.getData().text,
                updateState: editComponent,
                key: this.componentKey++
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
        return flows.map((flow) =>
            this.renderFlow({
                flowData: flow,
                components,
                color: getColor(flow),
                key: this.componentKey++
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
        return clouds.map((cloud) =>
            this.renderCloud({
                data: cloud,
                updateState: editComponent,
                color: getColor(cloud),
                key: this.componentKey++
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
        return connections.map((conn) =>
            this.renderConnection({
                conn,
                components,
                updateState: editComponent,
                showHandle: showConnectionHandles,
                key: this.componentKey++
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
        return params.map((param) =>
            this.renderParameter(
                this.makeTextProps(
                    param,
                    draggable,
                    editComponent,
                    getColor(param),
                    this.componentKey++
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
        return variables.map((sv) =>
            this.renderSumVariable(
                this.makeTextProps(
                    sv,
                    draggable,
                    editComponent,
                    getColor(sv),
                    this.componentKey++
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
        return variables.map((dv) =>
            this.renderDynamicVariable(
                this.makeTextProps(
                    dv,
                    draggable,
                    editComponent,
                    getColor(dv),
                    this.componentKey++
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
        allComponents: ComponentCollection,
        editComponent: (c: ComponentUiData) => void,
        getColor: (c: ComponentUiData) => string
    ): ReactElement[] {
        return staticModels.map((sm) => {
            return this.renderStaticModel({
                model: sm,
                allComponents,
                draggable: true,
                updateState: editComponent,
                renderer: this,
                getColor,
                key: this.componentKey++
            } as StaticModelProps);
        });
    }

    private makeTextProps(
        data: TextComponent<any, any>,
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

