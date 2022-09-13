import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import { FirebaseComponentModel as schema } from "database/build/export";
import { UiMode } from "../../../../../main/ts/UiMode";
import { Props as ScreenProps } from "../../../../../main/ts/components/screens/SimulationScreen";
import { Props as CanvasProps } from "../../../../../main/ts/components/Canvas/BaseCanvas";
import { Props as EditBoxProps } from "../../../../../main/ts/components/EditBox/EditBox";
import MockFirebaseDataModel from "../../../data/MockFirebaseDataModel";
import CanvasUtils from "../../Canvas/CanvasUtils";
import MockEditBox from "../../EditBox/MockEditBox";
import MockToolbar from "../../Toolbar/MockToolbar";
import SimulationScreenTest from "./SimulationScreenTest";
import CloudUiData from "../../../../../main/ts/components/ScreenObjects/CloudUiData";
import FlowUiData from "../../../../../main/ts/components/ScreenObjects/FlowUiData";
import ConnectionUiData from "../../../../../main/ts/components/ScreenObjects/ConnectionUiData";
import { waitFor } from "@testing-library/react";
import MockSaveModelBox from "../../SaveModelBox/MockSaveModelBox";
import MockRenderer from "../../Canvas/MockRenderer";


export default class SimulationScreenWithComponents extends SimulationScreenTest {

    private stock = new schema.StockFirebaseComponent(
        "1",
        { x: 0, y: 0, text: "stock", initvalue: "val" }
    );
    private cloud = new schema.CloudFirebaseComponent(
        "2",
        { x: 14, y: 11 }
    );
    private flow = new schema.FlowFirebaseComponent(
        "3",
        { from: this.stock.getId(), to: this.cloud.getId(), text: "flow", equation: "asdf" }
    );
    private param = new schema.ParameterFirebaseComponent(
        "4",
        { x: 123, y: 231, text: "param", value: "pval" }
    );
    private pToFlowConn = new schema.ConnectionFirebaseComponent("5", {
        from: this.param.getId(), to: this.flow.getId(), handleXOffset: 0, handleYOffset: 0
    });
    private pToStockConn = new schema.ConnectionFirebaseComponent("6", {
        from: this.param.getId(), to: this.stock.getId(), handleXOffset: 0, handleYOffset: 0
    });
    private flowToPConn = new schema.ConnectionFirebaseComponent("7", {
        from: this.flow.getId(), to: this.param.getId(), handleXOffset: 0, handleYOffset: 0
    });
    private components: schema.FirebaseDataComponent<any>[] = [
        this.stock, this.cloud, this.flow, this.param,
        this.pToFlowConn, this.pToStockConn, this.flowToPConn
    ];

    public describeTests(): void {
        beforeEach(() => {
            this.containerNode = document.createElement("div");
            document.body.appendChild(this.containerNode);
            this.root = createRoot(this.containerNode);

            this.firebaseDataModel = new MockFirebaseDataModel();
            this.createCanvasForMode = jest.fn(
                (m, p) => CanvasUtils.createCanvasWithMocksForMode(m, p)
            );
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
                renderer: this.renderer,
                sessionId: SimulationScreenTest.AN_ID,
            };
            act(
                () => this.root?.render(this.createSimulationScreen(props))
            );

            expect(this.firebaseDataModel.subscribeToSession).toHaveBeenCalledTimes(1);
            const callback = this.firebaseDataModel.subscribeToSession.mock.calls[0][1];
            this.createCanvasForMode?.mockReset();
            act(() => callback(this.components));
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

        test("Should have rendered screen with components", async () => {
            expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
            const canvasProps: CanvasProps = this.createCanvasForMode?.mock.calls[0][1];
            expect(canvasProps.components.length()).toBe(this.components.length);
            canvasProps.components.getAllComponents().forEach(
                c1 => expect(
                    this.components.find(
                        c2 => c1.getId() === c2.getId()
                            && c1.getType() === c2.getType()
                            && c1.getData() === c2.getData()
                    )
                ).toBeDefined()
            );
        });

        describe("Deletions", () => {
            test("Should notify Firebase when component deleted", async () => {
                expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                let canvasProps: CanvasProps = this.createCanvasForMode?.mock.calls[0][1];
                act(() => canvasProps.deleteComponent(this.pToStockConn.getId()));
                expect(this.firebaseDataModel?.removeComponents).toHaveBeenCalledTimes(1);
                expect(this.firebaseDataModel?.removeComponents)
                    .toHaveBeenCalledWith(
                        SimulationScreenTest.AN_ID,
                        [this.pToStockConn.getId()],
                        expect.anything()
                    );
            });

            test("Should correctly remove component from canvas when deleted", async () => {
                expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                let canvasProps: CanvasProps = this.createCanvasForMode?.mock.calls[0][1];
                act(() => canvasProps.deleteComponent(this.pToStockConn.getId()));
                expect(this.createCanvasForMode).toHaveBeenCalledTimes(2);
                canvasProps = this.createCanvasForMode?.mock.calls[1][1];
                expect(canvasProps.components.length()).toBe(this.components.length - 1);
                this.components
                    .filter(c => c.getId() !== this.pToStockConn.getId())
                    .forEach(
                        c1 => expect(
                            canvasProps.components.getAllComponents().find(c2 =>
                                c1.getId() === c2.getId()
                                && c1.getType() === c2.getType()
                                && c1.getData() === c2.getData()
                            )
                        ).toBeDefined()
                    );
            });

            test("Should successfully cascade-delete 1 layer of dependent components", async () => {
                expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                let canvasProps: CanvasProps = this.createCanvasForMode?.mock.calls[0][1];
                // Flow has dependent components: pToFlowConn and flowToPConn.
                // Should result in that one being deleted in addition to the flow
                const expectedDeletedComponentIds = [
                    this.flow.getId(), this.pToFlowConn.getId(), this.flowToPConn.getId()
                ];
                act(() => canvasProps.deleteComponent(this.flow.getId()));

                expect(this.firebaseDataModel?.removeComponents).toHaveBeenCalledTimes(1);
                const mockArgs = this.firebaseDataModel?.removeComponents.mock.lastCall;
                expect(mockArgs[0]).toBe(SimulationScreenTest.AN_ID);
                expectedDeletedComponentIds.forEach(
                    id => expect(mockArgs[1].includes(id)).toBe(true)
                );

                canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                expect(canvasProps.components.length())
                    .toBe(this.components.length - expectedDeletedComponentIds.length);
                this.components
                    .filter(c => !expectedDeletedComponentIds.includes(c.getId()))
                    .forEach(
                        c1 => expect(
                            canvasProps.components.getAllComponents().find(c2 =>
                                c1.getId() === c2.getId()
                                && c1.getType() === c2.getType()
                                && c1.getData() === c2.getData()
                            )
                        ).toBeDefined()
                    );
            });

            test(
                "Should successfully cascade-delete 2 layers of dependent components",
                async () => {
                    expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                    let canvasProps: CanvasProps = this.createCanvasForMode?.mock.calls[0][1];
                    // Stock has dependent components: flow and
                    // pToStockConn. Flow has dependent components:
                    // pToFlowConn and flowToPConn.  Should result in
                    // those 4 components being deleted in addition to
                    // the stock.
                    const expectedDeletedComponentIds = [
                        this.stock.getId(),
                        this.flow.getId(),
                        this.pToStockConn.getId(),
                        this.pToFlowConn.getId(),
                        this.flowToPConn.getId()
                    ];
                    act(() => canvasProps.deleteComponent(this.stock.getId()));

                    expect(this.firebaseDataModel?.removeComponents).toHaveBeenCalledTimes(1);
                    const mockArgs = this.firebaseDataModel?.removeComponents.mock.lastCall;
                    expect(mockArgs[0]).toBe(SimulationScreenTest.AN_ID);
                    expectedDeletedComponentIds.forEach(
                        id => expect(mockArgs[1].includes(id)).toBe(true)
                    );
                    canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.components.length())
                        .toBe(this.components.length - expectedDeletedComponentIds.length);
                    this.components
                        .filter(c => !expectedDeletedComponentIds.includes(c.getId()))
                        .forEach(
                            c1 => expect(
                                canvasProps.components.getAllComponents().find(c2 =>
                                    c1.getId() === c2.getId()
                                    && c1.getType() === c2.getType()
                                    && c1.getData() === c2.getData()
                                )
                            ).toBeDefined()
                        );
                });
        });

        describe("Edits to position", () => {
            const componentToEdit = this.cloud;
            const oldX = this.cloud.getData().x;
            const oldY = this.cloud.getData().y;
            const newX = oldX + 50;
            const newY = oldY + 50;
            const dragCloud = () => {
                expect(this.createCanvasForMode).toHaveBeenCalledTimes(1);
                let canvasProps: CanvasProps = this.createCanvasForMode?.mock.calls[0][1];
                act(
                    () => canvasProps.editComponent(
                        new CloudUiData(
                            componentToEdit
                                .withData({ ...componentToEdit.getData(), x: newX, y: newY })
                        )
                    )
                );
            };

            test("Should correctly update screen position when item dragged", async () => {
                dragCloud();
                const canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                expect(canvasProps.components.getAllComponents().find(c =>
                    c.getId() === componentToEdit.getId()
                    && c.getData().x === newX
                    && c.getData().y === newY
                )).toBeDefined();
                expect(canvasProps.components.length()).toBe(this.components.length);
                this.components
                    .filter(c => c.getId() !== componentToEdit.getId())
                    .forEach(c1 => expect(canvasProps.components.getAllComponents().find(
                        c2 => c1.getId() === c2.getId()
                            && c1.getType() === c2.getType()
                            && c1.getData() === c2.getData()
                    )));
            });

            test("Should notify firebase when item dragged", async () => {
                dragCloud();
                expect(this.firebaseDataModel?.updateComponent).toHaveBeenCalled();
                expect(this.firebaseDataModel?.updateComponent).toHaveBeenLastCalledWith(
                    SimulationScreenTest.AN_ID,
                    componentToEdit.withData({ ...componentToEdit.getData(), x: newX, y: newY })
                );
            });

            test("Should correctly update screen position when updated from Firebase", async () => {
                const newComponents = [
                    this.stock,
                    this.flow,
                    this.pToFlowConn,
                    this.pToStockConn,
                    this.param,
                    this.cloud.withData({ ...this.cloud.getData(), x: newX, y: newY })
                ];
                const callback = this.firebaseDataModel?.subscribeToSession.mock.lastCall[1];
                act(() => callback(newComponents));
                const canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                expect(canvasProps.components.length()).toBe(newComponents.length);
                newComponents.forEach(c1 => expect(canvasProps.components.getAllComponents().find(c2 =>
                    c1.getId() === c2.getId()
                    && c1.getType() === c2.getType()
                    && c1.getData() === c2.getData())).toBeDefined()
                );
            });
        });

        describe("Edit Box", () => {
            test("Edit Box should not be rendered when no components selected in Edit mode",
                async () => {
                    let canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.selectedComponentIds.length).toBe(0);
                    expect(this.lastRenderedToolbar).not.toBeNull();
                    act(() => this.lastRenderedToolbar?.setMode(UiMode.EDIT));
                    expect(this.createCanvasForMode)
                        .toHaveBeenLastCalledWith(UiMode.EDIT, expect.anything());
                    canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.selectedComponentIds.length).toBe(0);
                    expect(this.createEditBox).not.toHaveBeenCalled();
                    expect(this.lastRenderedEditBox).toBeNull();
                }
            );

            const switchToEditModeAndSelect =
                (selectedComponent: schema.FirebaseDataComponent<any>) => {
                    let canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.selectedComponentIds.length).toBe(0);
                    expect(this.lastRenderedToolbar).not.toBeNull();
                    act(() => this.lastRenderedToolbar?.setMode(UiMode.EDIT));
                    expect(this.createCanvasForMode)
                        .toHaveBeenLastCalledWith(UiMode.EDIT, expect.anything());
                    canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.selectedComponentIds.length).toBe(0);
                    act(() => canvasProps.setSelected([selectedComponent.getId()]))
                    canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.selectedComponentIds).toEqual([selectedComponent.getId()]);
                }

            test("Edit Box should be rendered when component selected in Edit mode", async () => {
                const selectedComponent = this.flow;
                switchToEditModeAndSelect(selectedComponent);
                expect(this.createEditBox).toHaveBeenCalled();
                expect(this.lastRenderedEditBox).not.toBeNull();
            });

            test("Edit Box should not be rendered after cancel button clicked", async () => {
                const selectedComponent = this.param;
                switchToEditModeAndSelect(selectedComponent);
                const lastEditBoxProps = this.createEditBox?.mock.lastCall[0] as EditBoxProps;
                this.lastRenderedEditBox = null;
                this.createEditBox?.mockReset();
                expect(this.firebaseDataModel).toBeTruthy();
                if (!this.firebaseDataModel) throw new Error();
                Object.values(this.firebaseDataModel).forEach(m => m.mockReset());
                act(() => lastEditBoxProps.handleCancel());
                expect(this.createEditBox).not.toHaveBeenCalled();
                expect(this.lastRenderedEditBox).toBeNull();
                let canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                expect(canvasProps.selectedComponentIds.length).toBe(0);
                Object.values(this.firebaseDataModel)
                    .forEach(m => expect(m).not.toHaveBeenCalled());
            });

            test("Component should be updated locally when Edit Box invokes callback", async () => {
                const selectedComponent = this.stock;
                const newText: string = "new";
                const updatedComponent = selectedComponent
                    .withData({ ...selectedComponent.getData(), text: newText });
                switchToEditModeAndSelect(selectedComponent);
                const lastEditBoxProps = this.createEditBox?.mock.lastCall[0] as EditBoxProps;
                this.lastRenderedEditBox = null;
                this.createEditBox?.mockReset();
                act(() => lastEditBoxProps.handleSave(updatedComponent));
                expect(this.createEditBox).not.toHaveBeenCalled();
                expect(this.lastRenderedEditBox).toBeNull();
                let canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                expect(canvasProps.selectedComponentIds.length).toBe(0);
                const componentAfterUpdate = canvasProps.components.getAllComponents()
                    .find(c => c.getId() === selectedComponent.getId());
                expect(componentAfterUpdate).toBeDefined();
                expect(componentAfterUpdate?.getType()).toBe(selectedComponent.getType());
                expect(componentAfterUpdate?.getData()).toEqual(updatedComponent.getData());
            });

            test("Should notify Firebase when Edit Box invokes callback", async () => {
                const selectedComponent = this.stock;
                const newX: number = 13;
                const updatedComponent = selectedComponent
                    .withData({ ...selectedComponent.getData(), x: newX });
                switchToEditModeAndSelect(selectedComponent);
                const lastEditBoxProps = this.createEditBox?.mock.lastCall[0] as EditBoxProps;
                this.lastRenderedEditBox = null;
                this.createEditBox?.mockReset();
                act(() => lastEditBoxProps.handleSave(updatedComponent));
                expect(this.createEditBox).not.toHaveBeenCalled();
                expect(this.lastRenderedEditBox).toBeNull();
                expect(this.firebaseDataModel).not.toBeNull();
                expect(this.firebaseDataModel?.updateComponent).toHaveBeenCalledTimes(1);
                expect(this.firebaseDataModel?.updateComponent)
                    .toHaveBeenLastCalledWith(SimulationScreenTest.AN_ID, updatedComponent);
            });
        });

        describe("Selection", () => {
            Object.values(UiMode).filter(m => m !== UiMode.MOVE).forEach(m => {
                test(
                    `Selected component should be cleared when switching from ` +
                    `Move mode into ${m} mode`,
                    async () => {
                        const selectedComponent = this.stock;
                        let canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                        act(() => canvasProps.setSelected([selectedComponent.getId()]));
                        canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                        expect(canvasProps.selectedComponentIds).toEqual([selectedComponent.getId()]);
                        expect(this.lastRenderedToolbar).not.toBeNull();
                        act(() => this.lastRenderedToolbar?.setMode(m));
                        expect(this.createCanvasForMode)
                            .toHaveBeenLastCalledWith(m, expect.anything());
                        await waitFor(() => {
                            canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                            expect(canvasProps.selectedComponentIds.length).toBe(0);
                        });
                    }
                );
            });
            test(
                "Selected component should be cleared when switching from " +
                "Stock mode into Move mode",
                async () => {
                    expect(this.lastRenderedToolbar).not.toBeNull();
                    act(() => this.lastRenderedToolbar?.setMode(UiMode.STOCK));
                    expect(this.createCanvasForMode)
                        .toHaveBeenLastCalledWith(UiMode.STOCK, expect.anything());

                    const selectedComponent = this.stock;
                    let canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    act(() => canvasProps.setSelected([selectedComponent.getId()]));
                    canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.selectedComponentIds).toEqual([selectedComponent.getId()]);

                    expect(this.lastRenderedToolbar).not.toBeNull();
                    act(() => this.lastRenderedToolbar?.setMode(UiMode.MOVE));
                    canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    await waitFor(() => {
                        canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                        expect(canvasProps.selectedComponentIds.length).toBe(0);
                    });
                });

            test("Should have no component selected after Flow created", async () => {
                expect(this.lastRenderedToolbar).not.toBeNull();
                act(() => this.lastRenderedToolbar?.setMode(UiMode.FLOW));
                expect(this.createCanvasForMode)
                    .toHaveBeenLastCalledWith(UiMode.FLOW, expect.anything());

                let canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                const newCloud = new CloudUiData(
                    new schema.CloudFirebaseComponent(
                        "123456",
                        {
                            x: 123,
                            y: 456
                        }
                    )
                );
                const newFlow = new FlowUiData(
                    new schema.FlowFirebaseComponent(
                        "654321",
                        {
                            from: this.stock.getId(),
                            to: newCloud.getId(),
                            text: "newflow",
                            equation: "1+1"
                        }
                    )
                );
                act(() => canvasProps.addComponent(newCloud));
                canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                expect(canvasProps.components.getAllComponents().find(c => c.getId() === newCloud.getId()))
                    .toBeDefined();

                act(() => canvasProps.setSelected([newFlow.getData().from]));
                canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                expect(canvasProps.selectedComponentIds).toEqual([newFlow.getData().from]);

                act(() => canvasProps.addComponent(newFlow));
                canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                expect(canvasProps.components.getAllComponents().find(c => c.getId() === newCloud.getId()))
                    .toBeDefined();
                await waitFor(() => {
                    canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.selectedComponentIds.length).toBe(0);
                });
            });

            test("Should have no component selected after Connection created", async () => {
                const newConn = new ConnectionUiData(
                    new schema.ConnectionFirebaseComponent(
                        "1234",
                        {
                            from: this.stock.getId(),
                            to: this.flow.getId(),
                            handleXOffset: 0,
                            handleYOffset: 1
                        }
                    )
                );
                let canvasProps: CanvasProps = this.createCanvasForMode?.mock.lastCall[1];
                act(() => canvasProps.setSelected([newConn.getData().from]));
                canvasProps = this.createCanvasForMode?.mock.lastCall[1];

                act(() => canvasProps.addComponent(newConn));
                await waitFor(() => {
                    canvasProps = this.createCanvasForMode?.mock.lastCall[1];
                    expect(canvasProps.selectedComponentIds.length).toBe(0);
                });
                expect(canvasProps.components.getAllComponents().find(c => c.getId() === newConn.getId()))
                    .toBeDefined();
            });
        });
    }
}

new SimulationScreenWithComponents().describeTests();
