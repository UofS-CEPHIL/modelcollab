import { FirebaseComponentModel as schema } from "database/build/export";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasSpy, { SumVarModeCanvasSpy } from "./CanvasSpy";

import CanvasTest from "./CanvasTest";
import { act } from "react-dom/test-utils";
import SumVariableUiData from "../../../../main/ts/components/ScreenObjects/SumVariableUiData";


class SumVarModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "SumVarModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasSpy {
        return new SumVarModeCanvasSpy(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {

            this.describeClickingComponentShouldSelectItAndNotCreateAnything();

            test("Clicking canvas should create new Sum Variable", async () => {
                const x = 133;
                const y = 690;
                const canvas = this.makeCanvasMock({});
                act(() => this.root?.render(canvas.render()));

                canvas.leftClickCanvas(x, y);
                expect(canvas.addComponentSpy).toHaveBeenCalled();
                const newComponent = canvas.addComponentSpy?.mock.lastCall[0] as SumVariableUiData;
                expect(newComponent.getType()).toBe(schema.ComponentType.SUM_VARIABLE);
            });

        });
    }

}

new SumVarModeCanvasTest().describeTest();
