import { fireEvent, getByRole } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import MockCanvas, { EditModeCanvasSpy } from "./MockCanvas";
import CanvasTest from "./CanvasTest";

class EditModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "EditModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): MockCanvas {
        return new EditModeCanvasSpy(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {
            // n.b. more tests in simulationscreen
            this.describeClickingCanvasShouldDoNothingIfNothingSelected();
            this.describeClickCanvasDeselctsSelectedItem();
            this.describeClickingComponentShouldSelectItAndNotCreateAnything();
        });
    }

}

new EditModeCanvasTest().describeTest();
