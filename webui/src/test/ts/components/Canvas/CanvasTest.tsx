import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import MockCanvas from "./MockCanvas";
import StockUiData from "../../../../main/ts/components/ScreenObjects/StockUiData";
import { FirebaseComponentModel as schema } from "database/build/export";
import FlowUiData from "../../../../main/ts/components/ScreenObjects/FlowUiData";
import ParameterUiData from "../../../../main/ts/components/ScreenObjects/ParameterUiData";
import SumVariableUiData from "../../../../main/ts/components/ScreenObjects/SumVariableUiData";
import DynamicVariableUiData from "../../../../main/ts/components/ScreenObjects/DynamicVariableUiData";
import ConnectionUiData from "../../../../main/ts/components/ScreenObjects/ConnectionUiData";
import CloudUiData from "../../../../main/ts/components/ScreenObjects/CloudUiData";
import ComponentUiData, { TextComponent } from "../../../../main/ts/components/ScreenObjects/ComponentUiData";
import ComponentCollection from "../../../../main/ts/components/Canvas/ComponentCollection";
import MockRenderer from "./MockRenderer";
import StaticModelUiData from "../../../../main/ts/components/ScreenObjects/StaticModelUiData";
import { LoadedStaticModel } from "../../../../main/ts/components/screens/SimulationScreen";
import { waitFor } from "@testing-library/react";

/*
  This needs to be done in order to make tests with Konva behave
  properly
 */
declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;


export function getAllComponentsFromFirstRenderCall(r: MockRenderer): ComponentUiData[] {
    return r.render.mock.calls[0][0].getAllComponents() as ComponentUiData[];
}

export default abstract class CanvasTest {

    protected static AN_ID: string = "123";

    protected abstract getCanvasName(): string;

    protected abstract shouldShowConnectionHandles(): boolean;

    protected abstract makeCanvasMock(props: Partial<CanvasProps>): MockCanvas;

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

            describe("Common tests - empty model", () => {
                test("Empty canvas should render nothing", async () => {
                    const canvas = this.makeCanvasMock({});
                    act(() => {
                        this.root?.render(canvas.render());
                    });
                    expect(this.containerNode?.innerHTML.includes("<canvas")).toBeTruthy();
                    canvas.expectNoComponentsRendered();
                });

                const doSingleStockTest = (selected: boolean) => {
                    const X = 0;
                    const Y = 0;
                    const stockText = "stock";
                    const stockValue = "0";
                    const stockId = CanvasTest.AN_ID;
                    const stock = new StockUiData(
                        new schema.StockFirebaseComponent(
                            stockId,
                            { x: X, y: Y, text: stockText, initvalue: stockValue }
                        )
                    );
                    const canvas = this.makeCanvasMock({
                        components: new ComponentCollection([stock]),
                        selectedComponentIds: selected ? [stock.getId()] : []
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
                    expect(canvas.mockRenderer?.render).toHaveBeenCalledTimes(1);
                    const stockUiData = canvas.mockRenderer
                        ?.render
                        .mock
                        .calls[0][0]
                        .getAllComponents()[0] as StockUiData;
                    expect(stockUiData).toBeDefined();
                    expect(stockUiData.getDatabaseObject()).toEqual(
                        {
                            id: stockId,
                            data: { initvalue: stockValue, text: stockText, x: X, y: Y }
                        }
                    );
                };

                test("Single unselected stock should be rendered with correct props", async () => {
                    doSingleStockTest(false);
                });

                test("Single selected stock should be rendered with correct props", async () => {
                    doSingleStockTest(true);
                });
            });

            describe("Common tests - model with all components", () => {
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
                const staticModelId = "10";
                const staticModelColor = "blue";
                const staticModelModelId = "123";
                const staticModel = new StaticModelUiData(
                    new schema.StaticModelComponent(
                        staticModelId,
                        { x: X, y: Y, modelId: staticModelModelId, color: staticModelColor }
                    )
                );
                const childComponent = new StockUiData(new schema.StockFirebaseComponent("321", { x: 0, y: 0, text: "", initvalue: "" }));
                staticModel.setComponents([childComponent]);
                const selectedComponentIds = [stockId];
                const components = new ComponentCollection([
                    stock, cloud, flow, sumVar, dynVar, param,
                    svToVarConn, paramToVarConn, varToFlowConn,
                    staticModel
                ]);

                let canvas: MockCanvas = this.makeCanvasMock({});

                beforeEach(() => {
                    canvas = this.makeCanvasMock({ components, selectedComponentIds });
                    act(() => this.root?.render(canvas.render()));
                });

                const getAllComponentsFromRenderArgs = () => {
                    if (canvas.mockRenderer)
                        return getAllComponentsFromFirstRenderCall(canvas.mockRenderer);
                    else
                        return [];
                }

                Object.values(schema.ComponentType)
                    .filter(type => type !== schema.ComponentType.CONNECTION)
                    .forEach((type: schema.ComponentType) => {
                        test(`Exactly one ${type} should be rendered.`, async () => {
                            const allComponents = getAllComponentsFromRenderArgs();
                            expect(allComponents).toBeDefined();
                            expect(allComponents.filter(c => c.getType() === type).length).toBe(1);
                        });
                    });


                test("renderConnections should have been called 3 times", async () => {
                    const allComponents = getAllComponentsFromRenderArgs();
                    expect(allComponents).toBeDefined();
                    expect(
                        allComponents.filter(
                            c => c.getType() === schema.ComponentType.CONNECTION).length
                    ).toBe(3);
                });

                test("Stock should be rendered with correct props", async () => {
                    const stockData = getAllComponentsFromRenderArgs()
                        .filter(c => c.getType() === schema.ComponentType.STOCK)[0];
                    expect(stockData).toBeDefined();
                    expect(stockData.getData().text).toBe(stockText);
                    expect(stockData.getId()).toBe(stockId);
                    expect(stockData.getData().x).toBe(X);
                    expect(stockData.getData().y).toBe(Y);
                });

                test("Cloud should be rendered with correct props", async () => {
                    const cloudData = getAllComponentsFromRenderArgs()
                        .filter(c => c.getType() === schema.ComponentType.CLOUD)[0];
                    expect(cloudData).toBeDefined();
                    expect(cloudData.getId()).toBe(cloudId);
                    expect(cloudData.getData().x).toBe(X);
                    expect(cloudData.getData().y).toBe(Y);
                });

                test("Flow should be rendered with correct props", async () => {
                    const flowData = getAllComponentsFromRenderArgs()
                        .filter(c => c.getType() === schema.ComponentType.FLOW)[0];
                    expect(flowData).toBeDefined();
                    expect(flowData.getId()).toBe(flowId);
                    expect(flowData.getData().equation).toBe(flowEqn);
                    expect(flowData.getData().from).toBe(flowFrom);
                    expect(flowData.getData().to).toBe(flowTo);
                    expect(flowData.getData().text).toBe(flowText);
                });

                const testTextComponent = (data: any, id: string, text: string) => {
                    const textData = data as TextComponent<any>;
                    expect(textData).toBeDefined();
                    expect(textData.getId()).toBe(id);
                    expect(textData.getData().text).toBe(text);
                    expect(textData.getData().x).toBe(X);
                    expect(textData.getData().y).toBe(Y);
                };

                test("Dynamic Variable should be rendered with correct props", async () => {
                    testTextComponent(
                        getAllComponentsFromRenderArgs()
                            .filter(c => c.getType() === schema.ComponentType.VARIABLE)[0],
                        dynVarId,
                        dynVarText
                    );
                });

                test("Sum Variable should be rendered with correct props", async () => {
                    testTextComponent(
                        getAllComponentsFromRenderArgs()
                            .filter(c => c.getType() === schema.ComponentType.SUM_VARIABLE)[0],
                        sumVarId,
                        sumVarText
                    );
                });

                test("Parameter should be rendered with correct props", async () => {
                    testTextComponent(
                        getAllComponentsFromRenderArgs()
                            .filter(c => c.getType() === schema.ComponentType.PARAMETER)[0],
                        paramId,
                        paramText
                    );
                });

                const testConnection = (data: any, id: string, from: string, to: string) => {
                    const connData = data as ConnectionUiData;
                    expect(connData).toBeDefined();
                    expect(connData.getId()).toBe(id);
                    expect(connData.getData().from).toBe(from);
                    expect(connData.getData().to).toBe(to);
                    expect(connData.getData().handleXOffset).toBe(X);
                    expect(connData.getData().handleYOffset).toBe(Y);
                };

                test(
                    "Sum Variable -> Dynamic Variable connection should be rendered " +
                    "with correct props",
                    async () => {
                        const connectionData: ConnectionUiData | undefined =
                            getAllComponentsFromRenderArgs()
                                .filter(c => c.getType() === schema.ComponentType.CONNECTION)
                                .find(
                                    c => c.getData().from === sumVarId
                                ) as ConnectionUiData;
                        expect(connectionData).toBeDefined();
                        testConnection(connectionData, svToVarConnId, sumVarId, dynVarId);
                    });

                test(
                    "Param -> Dynamic Variable connection should be rendered " +
                    "with correct props",
                    async () => {
                        const connectionData: ConnectionUiData =
                            getAllComponentsFromRenderArgs()
                                .filter(c => c.getType() === schema.ComponentType.CONNECTION)
                                .find(
                                    c => c.getData().from === paramId
                                ) as ConnectionUiData;
                        expect(connectionData).toBeDefined();
                        testConnection(connectionData, paramToVarConnId, paramId, dynVarId);
                    });

                test("Dynamic Variable -> Flow connection should be rendered " +
                    "with correct props",
                    async () => {
                        const connectionData: ConnectionUiData =
                            getAllComponentsFromRenderArgs()
                                .filter(c => c.getType() === schema.ComponentType.CONNECTION)
                                .find(
                                    c => c.getData().from === dynVarId
                                ) as ConnectionUiData;
                        expect(connectionData).toBeDefined();
                        testConnection(connectionData, varToFlowConnId, dynVarId, flowId);
                    }
                );

                test("Right-clicking canvas should deselect selected component", async () => {
                    canvas.rightClickCanvas(333, 333);
                    expect(canvas.setSelectedSpy).toHaveBeenCalledTimes(1);
                    expect(canvas.setSelectedSpy).toHaveBeenCalledWith([]);
                });
            });
        });
    }

    protected describeClickCanvasDeselctsSelectedItem(): void {
        test("Clicking on canvas should deselect selected item", async () => {
            const child = new StockUiData(new schema.StockFirebaseComponent(
                "12345",
                { x: 0, y: 0, text: "stocktext", initvalue: "1" }
            ));
            const canvas = this.makeCanvasMock(
                { selectedComponentIds: [child.getId()], components: new ComponentCollection([child]) }
            );
            act(() => this.root?.render(canvas.render()));

            canvas.leftClickCanvas(0, 0);
            expect(canvas.setSelectedSpy).toHaveBeenCalledTimes(1);
            expect(canvas.setSelectedSpy).toHaveBeenCalledWith([]);
        });
    }

    protected describeClickingComponentShouldSelectItAndNotCreateAnything(): void {
        test("Clicking on component should select it", async () => {
            const child = new CloudUiData(new schema.CloudFirebaseComponent(
                "12345",
                { x: 0, y: 0 }
            ));
            const canvas = this.makeCanvasMock(
                { selectedComponentIds: [], components: new ComponentCollection([child]) }
            );
            act(() => this.root?.render(canvas.render()));
            canvas.clickComponent(child);
            expect(canvas.setSelectedSpy).toHaveBeenCalledTimes(1);
            expect(canvas.setSelectedSpy).toHaveBeenCalledWith([child.getId()]);
            expect(canvas.addComponentSpy).not.toHaveBeenCalled();
        })
    }

    protected describeClickingCanvasShouldDoNothingIfNothingSelected(): void {
        test("Clicking on canvas should do nothing when no component is selected", async () => {
            const canvas = this.makeCanvasMock({});
            act(() => this.root?.render(canvas.render()));
            canvas.leftClickCanvas(0, 0);
            canvas.expectNothingHappened();
        });
    }

    protected describeClickingCanvasShouldDoNothingIfComponentSelected(): void {
        test("Clicking on canvas should do nothing when a component is selected", async () => {
            const stock = new StockUiData(
                new schema.StockFirebaseComponent(
                    "0",
                    { x: 0, y: 0, text: "text", initvalue: "value" }
                )
            );
            const canvas = this.makeCanvasMock({
                components: new ComponentCollection([stock]),
                selectedComponentIds: [stock.getId()]
            });
            act(() => {
                this.root?.render(canvas.render());
            });
            canvas.leftClickCanvas(123, 456);
            canvas.expectNothingHappened();
        });
    }
}
