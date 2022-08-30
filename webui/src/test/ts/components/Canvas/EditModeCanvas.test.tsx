import { fireEvent, getByRole } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { EditModeCanvasMock } from "./CanvasWithMocks";
import CanvasTest from "./CanvasTest";

class EditModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "EditModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new EditModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {

    }

}

new EditModeCanvasTest().describeTest();
