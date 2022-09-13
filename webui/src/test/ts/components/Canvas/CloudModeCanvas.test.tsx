import { act } from "react-dom/test-utils";
import { FirebaseComponentModel as schema } from "database/build/export";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CloudUiData from "../../../../main/ts/components/ScreenObjects/CloudUiData";
import MockCanvas, { CloudModeCanvasSpy } from "./MockCanvas";
import CanvasTest from "./CanvasTest";
import ComponentCollection from "../../../../main/ts/components/Canvas/ComponentCollection";

class CloudModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "CloudModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): MockCanvas {
        return new CloudModeCanvasSpy(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {

            const A_CLOUD = new CloudUiData(new schema.CloudFirebaseComponent(
                "8675309",
                { x: 0, y: 0 }
            ));

            test("Clicking on canvas should create new cloud", async () => {
                const x = 32;
                const y = 113;
                const canvas = this.makeCanvasMock({});
                act(() => this.root?.render(canvas.render()));
                canvas.leftClickCanvas(x, y);
                expect(canvas.addComponentSpy).toHaveBeenCalledTimes(1);
                const cloud = canvas.addComponentSpy?.mock.lastCall[0] as CloudUiData;
                expect(cloud).toBeDefined();
                expect(cloud.getData().x).toBe(x);
                expect(cloud.getData().y).toBe(y);
            });

            test("Clicking on canvas should create new cloud when item selected", async () => {
                const newX = 123;
                const newY = 456;
                const canvas = this.makeCanvasMock(
                    { selectedComponentIds: [A_CLOUD.getId()], components: new ComponentCollection([A_CLOUD]) }
                );
                act(() => this.root?.render(canvas.render()));

                canvas.leftClickCanvas(newX, newY);
                expect(canvas.addComponentSpy).toHaveBeenCalledTimes(1);
                const stock = canvas.addComponentSpy?.mock.lastCall[0] as CloudUiData;
                expect(stock.getData().x).toBe(newX);
                expect(stock.getData().y).toBe(newY);
                expect(stock.getId()).not.toBe(A_CLOUD.getId());
            });

            this.describeClickingComponentShouldSelectItAndNotCreateAnything();
        });
    }

}

new CloudModeCanvasTest().describeTest();
