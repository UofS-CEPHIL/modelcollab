import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { FirebaseComponentModel as schema } from "database/build/export";
import { UiMode } from "../../../../../main/ts/UiMode";
import { Props as ScreenProps } from "../../../../../main/ts/components/Screens/CanvasScreen";
import { Props as CanvasProps } from "../../../../../main/ts/components/Canvas/BaseCanvas";
import { Props as ToolbarProps } from "../../../../../main/ts/components/Toolbar/CanvasScreenToolbar";
import CanvasUtils from "../../Canvas/CanvasUtils";
import MockToolbar from "../../Toolbar/MockToolbar";
import CanvasScreenTest from "./CanvasScreenTest";
import MockEditBox from "../../EditBox/MockEditBox";
import MockFirebaseDataModel from "../../../data/MockFirebaseDataModel";
import { ComponentType } from "database/build/FirebaseComponentModel";
import StockUiData from "../../../../../main/ts/components/Canvas/ScreenObjects/Stock/StockUiData";
import MockSaveModelBox from "../../SaveModelBox/MockSaveModelBox";
import StaticModelUiData from "../../../../../main/ts/components/Canvas/ScreenObjects/StaticModel/StaticModelUiData";
import { waitFor } from "@testing-library/react";
import MockRenderer from "../../Canvas/MockRenderer";
import ComponentCollection from "../../../../../main/ts/components/Canvas/ComponentCollection";
import SumVariableUiData from "../../../../../main/ts/components/Canvas/ScreenObjects/SumVariable/SumVariableUiData";

export default class CanvasScreenEmpty extends CanvasScreenTest {
    public describeTests(): void {
        describe("<SimulationScreen /> Empty", () => {
            beforeEach(() => {
                this.containerNode = document.createElement("div");
                document.body.appendChild(this.containerNode);
                this.root = createRoot(this.containerNode);

                this.firebaseDataModel = new MockFirebaseDataModel();
                this.createCanvasForMode = jest.fn((m, p) => CanvasUtils.createCanvasWithMocksForMode(m, p));
                this.createToolbar = jest.fn(p => {
                    this.lastRenderedToolbar = new MockToolbar(p);
                    return this.lastRenderedToolbar.render();
                });
                this.createEditBox = jest.fn(p => {
                    this.lastRenderedEditBox = new MockEditBox(p);
                    return this.lastRenderedEditBox.render();
                });
                this.createSaveModelBox = jest.fn(p => {
                    this.lastRenderedSaveModelBox = new MockSaveModelBox(p);
                    return this.lastRenderedSaveModelBox.render();
                });
                this.renderer = new MockRenderer();
                this.returnToSessionSelect = jest.fn();
                const props: ScreenProps = {
                    createCanvasForMode: this.createCanvasForMode,
                    createToolbar: this.createToolbar,
                    createEditBox: this.createEditBox,
                    createSaveModelBox: this.createSaveModelBox,
                    firebaseDataModel: this.firebaseDataModel,
                    returnToSessionSelect: this.returnToSessionSelect,
                    sessionId: CanvasScreenTest.AN_ID,
                    renderer: this.renderer
                };
                act(
                    () => this.root?.render(this.createSimulationScreen(props))
                );
            });

            afterEach(() => {
                this.containerNode = null;
                this.root = null;
                this.firebaseDataModel = null;
                this.createCanvasForMode = null;
                this.createToolbar = null;
                this.createEditBox = null;
                this.createSaveModelBox = null;
                this.lastRenderedSaveModelBox = null;
                this.returnToSessionSelect = null;
                this.lastRenderedEditBox = null;
                this.lastRenderedToolbar = null;
                jest.resetAllMocks();
            });

            const getCanvasProps = () => this.createCanvasForMode?.mock.lastCall[1] as CanvasProps;

            test("Should start with none selected", async () => {
                expect(getCanvasProps().selectedComponentIds.length).toBe(0);
            });

            test("Should not render an edit box", async () => {
                expect(this.lastRenderedEditBox).toBeNull();
                expect(this.createEditBox).not.toHaveBeenCalled();
            });

            describe("Canvas", () => {
                test("Should create a canvas when rendering screen", async () => {
                    expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                });

                test("Should create a canvas in Move mode by default", async () => {
                    expect(this.createCanvasForMode).toHaveBeenCalledWith(UiMode.MOVE, expect.anything());
                });

                test("Should start with empty canvas", async () => {
                    expect(getCanvasProps().components.length()).toBe(0);
                });

                test("Should have subscribed to the Firebase session", async () => {
                    expect(this.firebaseDataModel?.subscribeToSession).toHaveBeenCalledTimes(1);
                    expect(this.firebaseDataModel?.subscribeToSession).toHaveBeenCalledWith(CanvasScreenTest.AN_ID, expect.anything());
                });

                test("Should re-render with a new stock when Firebase adds a stock", async () => {
                    expect(this.firebaseDataModel?.subscribeToSession).toHaveBeenCalledTimes(1);
                    const callback = this.firebaseDataModel?.subscribeToSession.mock.calls[0][1];
                    const stock = CanvasScreenTest.createArbitraryStock();
                    jest.resetAllMocks();
                    act(() => callback([stock]));
                    expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                    const canvasProps = getCanvasProps();
                    expect(canvasProps.components.length()).toBe(1);
                    expect(canvasProps.components.getAllComponentsIncludingChildren()[0].getData()).toEqual(stock.getData());
                    expect(canvasProps.components.getAllComponentsIncludingChildren()[0].getId()).toBe(stock.getId());
                    expect(canvasProps.components.getAllComponentsIncludingChildren()[0].getType()).toBe(ComponentType.STOCK);
                    expect(canvasProps.selectedComponentIds.length).toBe(0);
                });

                test("Should notify Firebase when component created on UI", async () => {
                    expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                    const canvasProps = getCanvasProps();
                    const stock = CanvasScreenTest.createArbitraryStock();
                    act(() => canvasProps.addComponent(new StockUiData(stock)));
                    expect(this.firebaseDataModel?.updateComponent).toHaveBeenCalledTimes(1);
                    expect(this.firebaseDataModel?.updateComponent).toHaveBeenCalledWith(CanvasScreenEmpty.AN_ID, stock);
                });

                describe("Static Model", () => {

                    let staticModel: StaticModelUiData;
                    const X = 0, Y = 0, COLOR = "blue";

                    beforeEach(() => {
                        staticModel = new StaticModelUiData(
                            new schema.StaticModelComponent(
                                CanvasScreenTest.AN_ID,
                                {
                                    x: X,
                                    y: Y,
                                    modelId: CanvasScreenTest.AN_ID,
                                    color: COLOR
                                }
                            )
                        );
                    });

                    const clickImportModelButton = () => {
                        expect(this.createToolbar).toHaveBeenCalledTimes(1);
                        const toolbarProps = this.createToolbar?.mock.lastCall[0] as ToolbarProps;
                        act(() => toolbarProps.importModel(staticModel.getData().modelId));
                    }

                    const addModelFromFirebase = () => {
                        const callback = this.firebaseDataModel?.subscribeToSession.mock.lastCall[1];
                        act(() => callback([staticModel.getDatabaseObject()]));
                    }

                    test("Should load model data from Firebase when Static Model created on the UI", async () => {
                        clickImportModelButton();
                        expect(this.firebaseDataModel?.getComponentsForSavedModel).toHaveBeenCalled();
                        expect(this.firebaseDataModel?.getComponentsForSavedModel.mock.lastCall[0]).toBe(CanvasScreenTest.AN_ID);
                    });

                    test("Should create a UI component when static model imported from toolbar", async () => {
                        clickImportModelButton();
                        waitFor(() => { expect(getCanvasProps().components.getAllComponentsIncludingChildren().length).toBe(1) });
                        waitFor(() => { expect(getCanvasProps().components.getStaticModels().length).toBe(1) });
                    });

                    test("Should notify firebase when Static Model created on the UI", async () => {
                        clickImportModelButton();
                        expect(this.firebaseDataModel?.updateComponent).toHaveBeenCalledTimes(1);
                        expect(this.firebaseDataModel?.updateComponent).toHaveBeenCalledWith(staticModel.getId(), expect.anything());
                    });

                    test("Should load model data from Firebase when Static Model created in Firebase", async () => {
                        addModelFromFirebase();
                        expect(this.firebaseDataModel?.getComponentsForSavedModel).toHaveBeenCalledTimes(1);
                        expect(this.firebaseDataModel?.getComponentsForSavedModel.mock.lastCall[0]).toBe(CanvasScreenTest.AN_ID);
                    });

                    test("Should not render any child components when no models loaded", async () => {
                        clickImportModelButton();
                        expect(this.renderer?.render).toHaveBeenCalledTimes(1);
                        expect(this.renderer?.render).toHaveBeenLastCalledWith(
                            new ComponentCollection([]),
                            expect.anything(), expect.anything(), expect.anything(), expect.anything()
                        );
                    });

                    test("Should render child components when matching model loaded", async () => {
                        const component = new schema.SumVariableFirebaseComponent("321", { x: 123, y: 456, text: "" });
                        addModelFromFirebase();
                        const onData = this.firebaseDataModel?.getComponentsForSavedModel.mock.lastCall[1];
                        act(() => onData([component]));
                        const lastCallComponents = this.renderer?.render.mock.lastCall[0];
                        expect(lastCallComponents.length()).toBe(1);
                        expect(lastCallComponents.getAllComponents()[0]).toBe(new SumVariableUiData(component));
                        // TODO figure out how to test this                        
                    });
                });
            });

            describe("Toolbar", () => {
                test("Should create a toolbar when rendering screen", async () => {
                    expect(this.createToolbar).toHaveBeenCalledTimes(1);
                });

                const testSwitchToMode = (mode: UiMode) => {
                    expect(this.lastRenderedToolbar).not.toBeNull();
                    jest.resetAllMocks();
                    act(() => this.lastRenderedToolbar?.setMode(mode));
                    expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                    expect(this.createCanvasForMode).toHaveBeenCalledWith(mode, expect.anything());
                }

                Object.values(UiMode).forEach(m => {
                    test(
                        `Should render an appropriate type of Canvas when mode changes to ${m}`,
                        async () => testSwitchToMode(m)
                    );
                });
            });
        });
    }
}

new CanvasScreenEmpty().describeTests();
