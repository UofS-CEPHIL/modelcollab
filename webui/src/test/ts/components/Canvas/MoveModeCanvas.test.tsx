import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import MockCanvas, { MoveModeCanvasSpy } from "./MockCanvas";
import CanvasTest from "./CanvasTest";


class MoveModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "MoveModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): MockCanvas {
        return new MoveModeCanvasSpy(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {
            this.describeClickingCanvasShouldDoNothingIfNothingSelected();
            this.describeClickCanvasDeselctsSelectedItem();
            this.describeClickingComponentShouldSelectItAndNotCreateAnything();
        });
    }

}

new MoveModeCanvasTest().describeTest();
