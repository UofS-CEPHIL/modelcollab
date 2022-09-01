import { FirebaseComponentModel as schema } from "database/build/export";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { ParameterModeCanvasMock } from "./CanvasWithMocks";

import CanvasTest from "./CanvasTest";
import { act } from "react-dom/test-utils";
import ParameterUiData from "../../../../main/ts/components/ScreenObjects/ParameterUiData";


class ParameterModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "ParameterModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new ParameterModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {

            this.describeClickingComponentShouldSelectItAndNotCreateAnything();

            test("Should create a new parameter when canvas clicked", async () => {
                const x = 412;
                const y = 214;
                const canvas = this.makeCanvasMock({});
                act(() => this.root?.render(canvas.render()));

                act(() => canvas.clickCanvas(x, y));
                expect(canvas.addComponentSpy).toHaveBeenCalledTimes(1);
                const newComponent = canvas.addComponentSpy?.mock.lastCall[0] as ParameterUiData;
                expect(newComponent.getType()).toBe(schema.ComponentType.PARAMETER);
                expect(newComponent.getData().x).toBe(x);
                expect(newComponent.getData().y).toBe(y);
            });

        });
    }

}

new ParameterModeCanvasTest().describeTest();
