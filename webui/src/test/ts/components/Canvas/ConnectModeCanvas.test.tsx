import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { ConnectionModeCanvasMock } from "./CanvasWithMocks";
import { FirebaseComponentModel as schema } from "database/build/export";

import CanvasTest from "./CanvasTest";
import ComponentUiData, { PointableComponent } from "../../../../main/ts/components/ScreenObjects/ComponentUiData";
import { act } from "react-dom/test-utils";
import ConnectionUiData from "../../../../main/ts/components/ScreenObjects/ConnectionUiData";
import StockUiData from "../../../../main/ts/components/ScreenObjects/StockUiData";
import FlowUiData from "../../../../main/ts/components/ScreenObjects/FlowUiData";
import ParameterUiData from "../../../../main/ts/components/ScreenObjects/ParameterUiData";
import DynamicVariableUiData from "../../../../main/ts/components/ScreenObjects/DynamicVariableUiData";
import SumVariableUiData from "../../../../main/ts/components/ScreenObjects/SumVariableUiData";


class ConnectModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "ConnectModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new ConnectionModeCanvasMock({ ...props, showConnectionHandles: this.shouldShowConnectionHandles() });
    }

    protected shouldShowConnectionHandles(): boolean {
        return true;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {
            this.describeClickingCanvasShouldDoNothingIfNothingSelected();
            this.describeClickingComponentShouldSelectItAndNotCreateAnything();

            const stock1 = new StockUiData(
                new schema.StockFirebaseComponent(
                    "1",
                    {
                        x: 0,
                        y: 0,
                        text: "",
                        initvalue: ""
                    }
                )
            );
            const stock2 = new StockUiData(
                new schema.StockFirebaseComponent(
                    "2",
                    {
                        x: 23,
                        y: 23,
                        text: "23",
                        initvalue: "23"
                    }
                )
            );
            const param = new ParameterUiData(
                new schema.ParameterFirebaseComponent(
                    "3",
                    {
                        x: 32,
                        y: 44,
                        text: "parm",
                        value: ""
                    }
                )
            );
            const dynVar = new DynamicVariableUiData(
                new schema.VariableFirebaseComponent(
                    "4",
                    {
                        x: 123,
                        y: 456,
                        text: "dynvar",
                        value: ""
                    }
                )
            );
            const sumVar = new SumVariableUiData(
                new schema.SumVariableFirebaseComponent(
                    "5",
                    {
                        x: 222,
                        y: 111,
                        text: "sumvar"
                    }
                )
            );
            const flow = new FlowUiData(
                new schema.FlowFirebaseComponent(
                    "6",
                    {
                        from: stock1.getId(),
                        to: stock2.getId(),
                        text: "",
                        equation: ""
                    }
                )
            );

            const fromToConnectionList = [
                [stock1, stock2],
                [param, stock1],
                [dynVar, stock2],
                [sumVar, stock1],
                [sumVar, flow, stock1, stock2],
                [dynVar, flow, stock1, stock2],
                [param, flow, stock1, stock2],
                [stock1, flow, stock2],
                [stock2, flow, stock1]
            ];

            fromToConnectionList.forEach(([from, to, ...otherComponents]) => {
                this.testMakeConnection(from, to, [...otherComponents]);
            });
        });
    }

    private testMakeConnection(from: ComponentUiData, to: ComponentUiData, componentsList: ComponentUiData[]): void {
        test(
            `Should successfully make connection from ${from.getType()}, to ${to.getType()}`,
            async () => {
                const canvas = this.makeCanvasMock({ selectedComponentId: from.getId(), children: componentsList });
                act(() => this.root?.render(canvas.render()));
                canvas.clickComponent(to);

                expect(canvas.addComponentSpy).toHaveBeenCalledTimes(1);
                const newComponent = canvas.addComponentSpy?.mock.lastCall[0] as ConnectionUiData;
                expect(newComponent.getType()).toBe(schema.ComponentType.CONNECTION);
                expect(newComponent.getData().from).toBe(from.getId());
                expect(newComponent.getData().to).toBe(to.getId());
            }
        );
    }

}

new ConnectModeCanvasTest().describeTest();
