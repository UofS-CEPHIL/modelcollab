import { fireEvent, getByRole } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CloudUiData from "../../../../main/ts/components/ScreenObjects/CloudUiData";
import CanvasWithMocks, { CloudModeCanvasMock } from "./CanvasWithMocks";
import CanvasTest from "./CanvasTest";

class CloudModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "CloudModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new CloudModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {

    }

}

new CloudModeCanvasTest().describeTest();
