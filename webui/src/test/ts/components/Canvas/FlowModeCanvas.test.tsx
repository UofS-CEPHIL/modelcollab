import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import MockCanvas, { FlowModeCanvasSpy } from "./MockCanvas";
import { FirebaseComponentModel as schema } from "database/build/export";

import CanvasTest from "./CanvasTest";
import StockUiData from "../../../../main/ts/components/ScreenObjects/StockUiData";
import { act } from "react-dom/test-utils";
import FlowUiData from "../../../../main/ts/components/ScreenObjects/FlowUiData";
import CloudUiData from "../../../../main/ts/components/ScreenObjects/CloudUiData";
import ComponentUiData from "../../../../main/ts/components/ScreenObjects/ComponentUiData";
import ComponentCollection from "../../../../main/ts/components/Canvas/ComponentCollection";


class FlowModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "FlowModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): MockCanvas {
        return new FlowModeCanvasSpy(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {

            this.describeClickingComponentShouldSelectItAndNotCreateAnything();
            this.describeClickingCanvasShouldDoNothingIfNothingSelected();

            const stock1 = new StockUiData(
                new schema.StockFirebaseComponent(
                    "1",
                    { x: 0, y: 0, text: "", initvalue: "" }
                )
            );
            const stock2 = new StockUiData(
                new schema.StockFirebaseComponent(
                    "2",
                    { x: 123, y: 123, text: "", initvalue: "" }
                )
            );
            const cloud1 = new CloudUiData(
                new schema.CloudFirebaseComponent(
                    "3",
                    { x: 12, y: 12 }
                )
            );
            const cloud2 = new CloudUiData(
                new schema.CloudFirebaseComponent(
                    "4",
                    { x: 44, y: 66 }
                )
            );

            const flowFromTo = [
                [cloud1, cloud2],
                [stock2, cloud1],
                [cloud2, stock1],
                [stock1, stock2]
            ];

            flowFromTo.forEach(([from, to]) => this.testCreateFlow(from, to));

        });
    }

    private testCreateFlow(from: ComponentUiData, to: ComponentUiData): void {
        test(
            `Should successfully make flow from ${from.getType()} to ${to.getType()}`,
            async () => {
                const canvas = this.makeCanvasMock({ selectedComponentIds: [from.getId()], components: new ComponentCollection([from, to]) });
                act(() => this.root?.render(canvas.render()));
                canvas.clickComponent(to);

                expect(canvas.addComponentSpy).toHaveBeenCalledTimes(1);
                const newComponent = canvas.addComponentSpy?.mock.lastCall[0] as FlowUiData;
                expect(newComponent.getType()).toBe(schema.ComponentType.FLOW);
                expect(newComponent.getData().from).toBe(from.getId());
                expect(newComponent.getData().to).toBe(to.getId());
                expect(newComponent.getId()).not.toBe(from.getId());
                expect(newComponent.getId()).not.toBe(to.getId());
            }
        );
    }

}

new FlowModeCanvasTest().describeTest();
