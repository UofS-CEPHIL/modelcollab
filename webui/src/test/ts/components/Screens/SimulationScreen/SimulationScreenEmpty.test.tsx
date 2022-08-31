import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { FirebaseComponentModel as schema } from "database/build/export";
import { UiMode } from "../../../../../main/ts/UiMode";
import { Props as ScreenProps } from "../../../../../main/ts/components/screens/SimulationScreen";
import { Props as CanvasProps } from "../../../../../main/ts/components/Canvas/BaseCanvas";
import { Props as ToolbarProps } from "../../../../../main/ts/components/Toolbar/Toolbar";
import { Props as EditBoxProps } from "../../../../../main/ts/components/EditBox/EditBox";
import CanvasUtils from "../../Canvas/CanvasUtils";
import MockToolbar from "../../Toolbar/MockToolbar";
import SimulationScreenTest from "./SimulationScreenTest";
import { ReactElement } from "react";
import MockEditBox from "../../EditBox/MockEditBox";
import FirebaseDataModel from "../../../../../main/ts/data/FirebaseDataModel";
import MockFirebaseDataModel from "../../../data/MockFirebaseDataModel";
import { ComponentType } from "database/build/FirebaseComponentModel";
import StockUiData from "../../../../../main/ts/components/ScreenObjects/StockUiData";

export default class SimulationScreenEmpty extends SimulationScreenTest {
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
                this.returnToSessionSelect = jest.fn();
                const props: ScreenProps = {
                    createCanvasForMode: this.createCanvasForMode,
                    createToolbar: this.createToolbar,
                    createEditBox: this.createEditBox,
                    firebaseDataModel: this.firebaseDataModel,
                    returnToSessionSelect: this.returnToSessionSelect,
                    sessionId: SimulationScreenTest.AN_ID,
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
                this.returnToSessionSelect = null;
                this.lastRenderedEditBox = null;
                this.lastRenderedToolbar = null;
                jest.resetAllMocks();
            });

            test("Should start with none selected", async () => {
                const canvasProps: CanvasProps = (this.createCanvasForMode as jest.Mock).mock.calls[0][1];
                expect(canvasProps.selectedComponentId).toBeNull();
            });

            describe("Canvas", () => {
                test("Should create a canvas when rendering screen", async () => {
                    expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                });

                test("Should create a canvas in Move mode by default", async () => {
                    expect(this.createCanvasForMode).toHaveBeenCalledWith(UiMode.MOVE, expect.anything());
                });

                test("Should start with empty canvas", async () => {
                    const canvasProps: CanvasProps = (this.createCanvasForMode as jest.Mock).mock.calls[0][1];
                    expect(canvasProps.children.length).toBe(0);
                });

                test("Should have subscribed to the Firebase session", async () => {
                    expect(this.firebaseDataModel?.subscribeToSession).toHaveBeenCalledTimes(1);
                    expect(this.firebaseDataModel?.subscribeToSession).toHaveBeenCalledWith(SimulationScreenTest.AN_ID, expect.anything());
                });

                test("Should re-render with a new stock when Firebase adds a stock", async () => {
                    expect(this.firebaseDataModel?.subscribeToSession).toHaveBeenCalledTimes(1);
                    const callback = (this.firebaseDataModel?.subscribeToSession as jest.Mock).mock.calls[0][1];
                    const stock = SimulationScreenTest.createArbitraryStock();
                    jest.resetAllMocks();
                    act(() => callback([stock]));
                    expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                    const canvasProps = (this.createCanvasForMode as jest.Mock).mock.calls[0][1] as CanvasProps;
                    expect(canvasProps.children.length).toBe(1);
                    expect(canvasProps.children[0].getData()).toEqual(stock.getData());
                    expect(canvasProps.children[0].getId()).toBe(stock.getId());
                    expect(canvasProps.children[0].getType()).toBe(ComponentType.STOCK);
                    expect(canvasProps.selectedComponentId).toBeNull();
                });

                test("Should notify Firebase when component created on UI", async () => {
                    expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                    const canvasProps = (this.createCanvasForMode as jest.Mock).mock.calls[0][1] as CanvasProps;
                    const stock = SimulationScreenTest.createArbitraryStock();
                    act(() => canvasProps.addComponent(new StockUiData(stock)));
                    expect(this.firebaseDataModel?.updateComponent).toHaveBeenCalledTimes(1);
                    expect(this.firebaseDataModel?.updateComponent).toHaveBeenCalledWith(SimulationScreenEmpty.AN_ID, stock);
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

                test("Should not render an edit box", async () => {
                    expect(this.lastRenderedEditBox).toBeNull();
                    expect(this.createEditBox).not.toHaveBeenCalled();
                });
            });
        });
    }
}

new SimulationScreenEmpty().describeTests();
