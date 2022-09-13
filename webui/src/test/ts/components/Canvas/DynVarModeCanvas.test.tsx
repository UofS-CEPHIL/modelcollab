import { FirebaseComponentModel as schema } from "database/build/export";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import MockCanvas, { VariableModeCanvasSpy } from "./MockCanvas";

import CanvasTest from "./CanvasTest";
import { act } from "react-dom/test-utils";
import DynamicVariableUiData from "../../../../main/ts/components/ScreenObjects/DynamicVariableUiData";


class DynVarModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "DynVarModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): MockCanvas {
        return new VariableModeCanvasSpy(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {
            test("Clicking canvas should create new dynamic variable", () => {
                const x = 321;
                const y = 412;
                const canvas = this.makeCanvasMock({});
                act(() => this.root?.render(canvas.render()));

                canvas.leftClickCanvas(x, y);
                expect(canvas.addComponentSpy).toHaveBeenCalledTimes(1);
                const newComponent = canvas.addComponentSpy?.mock.lastCall[0] as DynamicVariableUiData;
                expect(newComponent.getType()).toBe(schema.ComponentType.VARIABLE);
                expect(newComponent.getData().x).toBe(x);
                expect(newComponent.getData().y).toBe(y);
            });
        });

        this.describeClickingComponentShouldSelectItAndNotCreateAnything();
    }
}

new DynVarModeCanvasTest().describeTest();
