import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import { SELECTED_COLOR, DEFAULT_COLOR } from "../../../../main/ts/components/ScreenObjects/Stock";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import CanvasWithMocks from "./CanvasWithMocks";
import { Props as TextProps } from "../../../../main/ts/components/ScreenObjects/TextObject";
import StockUiData from "../../../../main/ts/components/ScreenObjects/StockUiData";
import { Props as StockProps } from "../../../../main/ts/components/ScreenObjects/Stock";
import { FirebaseComponentModel as schema } from "database/build/export";
import FlowUiData from "../../../../main/ts/components/ScreenObjects/FlowUiData";
import { Props as FlowProps } from "../../../../main/ts/components/ScreenObjects/Flow";
import ParameterUiData from "../../../../main/ts/components/ScreenObjects/ParameterUiData";
import SumVariableUiData from "../../../../main/ts/components/ScreenObjects/SumVariableUiData";
import DynamicVariableUiData from "../../../../main/ts/components/ScreenObjects/DynamicVariableUiData";
import ConnectionUiData from "../../../../main/ts/components/ScreenObjects/ConnectionUiData";
import { Props as ConnectionProps } from "../../../../main/ts/components/ScreenObjects/Connection";
import CloudUiData from "../../../../main/ts/components/ScreenObjects/CloudUiData";
import { Props as CloudProps } from "../../../../main/ts/components/ScreenObjects/Cloud";
import ComponentUiData from "../../../../main/ts/components/ScreenObjects/ComponentUiData";

/*
  This needs to be done in order to make tests with Konva behave
  properly
 */
declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;




export default abstract class CanvasTest {

    protected static AN_ID: string = "123";

    protected abstract getCanvasName(): string;

    protected abstract shouldShowConnectionHandles(): boolean;

    protected abstract makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks;

    protected containerNode: HTMLElement | null = null;
    protected root: Root | null = null;

    protected makeSpecificTests(): void { };


    public describeTest(): void {
        describe(`<${this.getCanvasName()} /> `, () => {

            beforeEach(() => {
                this.containerNode = document.createElement("div");
                document.body.appendChild(this.containerNode);
                this.root = createRoot(this.containerNode);
            });

            afterEach(() => {
                if (!this.containerNode) throw new Error();
                act(() => this.root?.unmount());
                this.containerNode.remove();
                this.containerNode = null;
                this.root = null;
            });

            this.makeSpecificTests();

            test("Empty canvas should render nothing", async () => {
                const canvas = this.makeCanvasMock({});
                act(() => {
                    this.root?.render(canvas.render());
                });
                expect(this.containerNode?.innerHTML.includes("<canvas")).toBeTruthy();
                canvas.expectNoComponentsRendered();
            });

            const doSingleStockTest = (selected: boolean) => {
                const stockText = "stock";
                const stockValue = "0";
                const stockId = CanvasTest.AN_ID;
                const stock = new StockUiData(
                    new schema.StockFirebaseComponent(
                        stockId,
                        { x: 0, y: 0, text: stockText, initvalue: stockValue }
                    )
                );
                const canvas = this.makeCanvasMock({
                    children: [stock],
                    selectedComponentId: selected ? stock.getId() : null
                });
                act(() => {
                    this.root?.render(canvas.render());
                });
                canvas.expectNoCloudsRendered();
                canvas.expectNoConnectionsRendered();
                canvas.expectNoDynVarsRendered();
                canvas.expectNoFlowsRendered();
                canvas.expectNoSumVarsRendered();
                canvas.expectNoParamsRendered();
                expect(canvas.makeStockSpy).toHaveBeenCalledTimes(1);
                const stockProps = canvas.makeStockSpy?.mock.calls[0][0];
                expect(stockProps).toBeDefined();
                expect(stockProps.text).toBe(stockText);
                expect(stockProps.stock.dbObject).toEqual(
                    { id: stockId, data: { initvalue: stockValue, text: stockText, x: 0, y: 0 } }
                );
                expect(stockProps.draggable).toBe(true);
                expect(stockProps.color).toBe(selected ? SELECTED_COLOR : DEFAULT_COLOR);
            };

            test("Single unselected stock should be rendered with correct props", async () => {
                doSingleStockTest(false);
            });

            test("Single selected stock should be rendered with correct props", async () => {
                doSingleStockTest(true);
            });

            describe("Canvas with all component types", () => {
                const X = 0;
                const Y = 0;
                const stockId = "1";
                const stockText = "text1";
                const stockVal = "val1";
                const stock = new StockUiData(
                    new schema.StockFirebaseComponent(
                        stockId,
                        { x: X, y: Y, text: stockText, initvalue: stockVal }
                    )
                );
                const cloudId = "2";
                const cloud = new CloudUiData(
                    new schema.CloudFirebaseComponent(
                        cloudId,
                        { x: X, y: Y, }
                    )
                );
                const flowId = "3";
                const flowFrom = stockId;
                const flowTo = cloudId;
                const flowEqn = "1 + 1";
                const flowText = "flow";
                const flow = new FlowUiData(
                    new schema.FlowFirebaseComponent(
                        flowId,
                        { from: flowFrom, to: flowTo, equation: flowEqn, text: flowText }
                    )
                );
                const paramId = "4";
                const paramText = "param";
                const paramVal = "5";
                const param = new ParameterUiData(
                    new schema.ParameterFirebaseComponent(
                        paramId,
                        { x: X, y: Y, text: paramText, value: paramVal }
                    )
                );
                const sumVarId = "5";
                const sumVarText = "sumvar";
                const sumVar = new SumVariableUiData(
                    new schema.SumVariableFirebaseComponent(
                        sumVarId,
                        { text: sumVarText, x: X, y: Y }
                    )
                );
                const dynVarId = "6";
                const dynVarText = "dynvar";
                const dynVarVal = "param + 1";
                const dynVar = new DynamicVariableUiData(
                    new schema.VariableFirebaseComponent(
                        dynVarId,
                        { x: X, y: Y, text: dynVarText, value: dynVarVal }
                    )
                );
                const svToVarConnId = "7";
                const svToVarConn = new ConnectionUiData(
                    new schema.ConnectionFirebaseComponent(
                        svToVarConnId,
                        { from: sumVarId, to: dynVarId, handleXOffset: X, handleYOffset: Y }
                    )
                );
                const paramToVarConnId = "8";
                const paramToVarConn = new ConnectionUiData(
                    new schema.ConnectionFirebaseComponent(
                        paramToVarConnId,
                        { from: paramId, to: dynVarId, handleXOffset: X, handleYOffset: Y }
                    )
                );
                const varToFlowConnId = "9";
                const varToFlowConn = new ConnectionUiData(
                    new schema.ConnectionFirebaseComponent(
                        varToFlowConnId,
                        { from: dynVarId, to: flowId, handleXOffset: X, handleYOffset: Y }
                    )
                );
                const selectedComponentId = stockId;
                const children = [
                    stock, cloud, flow, sumVar, dynVar, param,
                    svToVarConn, paramToVarConn, varToFlowConn
                ];

                let canvas: CanvasWithMocks = this.makeCanvasMock({});
                function getExpectedColor(component: ComponentUiData): string {
                    return component.getId() === selectedComponentId
                        ? SELECTED_COLOR : DEFAULT_COLOR;
                }

                beforeEach(() => {
                    canvas = this.makeCanvasMock({ children, selectedComponentId });
                    act(() => this.root?.render(canvas.render()));
                });

                Object.keys(canvas.getSpies()).filter(name => name !== "makeConn").forEach((name: string) => {
                    test(`${name} should have been called one time`, async () => {
                        const mock = Object.entries(canvas.getSpies()).find(([n, _]) => name === n)?.[1];
                        expect(mock).toBeDefined();
                        expect(mock).toHaveBeenCalledTimes(1);
                    });
                });

                test("Stock should be rendered with correct props", async () => {
                    const stockProps = canvas.makeStockSpy?.mock.calls[0][0] as StockProps;
                    expect(stockProps).toBeDefined();
                    expect(stockProps.draggable).toBe(true);
                    expect(stockProps.color).toBe(getExpectedColor(stockProps.stock));
                    expect(stockProps.text).toBe(stockText);
                    expect(stockProps.stock.getId()).toBe(stockId);
                    expect(stockProps.stock.getData().x).toBe(X);
                    expect(stockProps.stock.getData().y).toBe(Y);
                });

                test("Cloud should be rendered with correct props", async () => {
                    const cloudProps = canvas.makeCloudSpy?.mock.calls[0][0] as CloudProps;
                    expect(cloudProps).toBeDefined();
                    expect(cloudProps.color).toBe(getExpectedColor(cloudProps.data));
                    expect(cloudProps.data.getId()).toBe(cloudId);
                    expect(cloudProps.data.getData().x).toBe(X);
                    expect(cloudProps.data.getData().y).toBe(Y);
                });

                test("Flow should be rendered with correct props", async () => {
                    const flowProps = canvas.makeFlowSpy?.mock.calls[0][0] as FlowProps;
                    expect(flowProps).toBeDefined();
                    expect(flowProps.color).toBe(getExpectedColor(flowProps.flowData));
                    expect(flowProps.components).toEqual(children);
                    expect(flowProps.flowData.getId()).toBe(flowId);
                    expect(flowProps.flowData.getData().equation).toBe(flowEqn);
                    expect(flowProps.flowData.getData().from).toBe(flowFrom);
                    expect(flowProps.flowData.getData().to).toBe(flowTo);
                    expect(flowProps.flowData.getData().text).toBe(flowText);
                });

                const testTextComponent = (props: any, id: string, text: string) => {
                    const textProps = props as TextProps;
                    expect(textProps).toBeDefined();
                    expect(textProps.color).toBe(getExpectedColor(textProps.data));
                    expect(textProps.draggable).toBe(true);
                    expect(textProps.data.getId()).toBe(id);
                    expect(textProps.data.getData().text).toBe(text);
                    expect(textProps.data.getData().x).toBe(X);
                    expect(textProps.data.getData().y).toBe(Y);
                };

                test("Dynamic Variable should be rendered with correct props", async () => {
                    testTextComponent(canvas.makeDynVarSpy?.mock.calls[0][0], dynVarId, dynVarText);
                });

                test("Sum Variable should be rendered with correct props", async () => {
                    testTextComponent(canvas.makeSumVarSpy?.mock.calls[0][0], sumVarId, sumVarText);
                });

                test("Parameter should be rendered with correct props", async () => {
                    testTextComponent(canvas.makeParamSpy?.mock.calls[0][0], paramId, paramText);
                });

                const testConnection = (props: any, id: string, from: string, to: string) => {
                    const connProps = props as ConnectionProps;
                    expect(connProps).toBeDefined();
                    expect(connProps.components).toEqual(children);
                    expect(connProps.showHandle).toBe(this.shouldShowConnectionHandles());
                    expect(connProps.conn.getId()).toBe(id);
                    expect(connProps.conn.getData().from).toBe(from);
                    expect(connProps.conn.getData().to).toBe(to);
                    expect(connProps.conn.getData().handleXOffset).toBe(X);
                    expect(connProps.conn.getData().handleYOffset).toBe(Y);
                };

                test("Sum Variable -> Dynamic Variable connection should be rendered with correct props", async () => {
                    const connectionProps: ConnectionProps = canvas.makeConnSpy?.mock.calls.find(
                        c => (c[0] as ConnectionProps).conn.getData().from === sumVarId
                    )[0];
                    expect(connectionProps).toBeDefined();
                    testConnection(connectionProps, svToVarConnId, sumVarId, dynVarId);
                });

                test("Param -> Dynamic Variable connection should be rendered with correct props", async () => {
                    const connectionProps: ConnectionProps = canvas.makeConnSpy?.mock.calls.find(
                        c => (c[0] as ConnectionProps).conn.getData().from === paramId
                    )[0];
                    expect(connectionProps).toBeDefined();
                    testConnection(connectionProps, paramToVarConnId, paramId, dynVarId);
                });

                test("Dynamic Variable -> Flow connection should be rendered with correct props", async () => {
                    const connectionProps: ConnectionProps = canvas.makeConnSpy?.mock.calls.find(
                        c => (c[0] as ConnectionProps).conn.getData().from === dynVarId
                    )[0];
                    expect(connectionProps).toBeDefined();
                    testConnection(connectionProps, varToFlowConnId, dynVarId, flowId);
                });

            });
        });
    }
}
