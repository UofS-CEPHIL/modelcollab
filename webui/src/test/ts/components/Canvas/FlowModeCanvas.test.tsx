import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { FlowModeCanvasMock } from "./CanvasWithMocks";

import CanvasTest from "./CanvasTest";


class FlowModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "FlowModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new FlowModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {

    }

}

new FlowModeCanvasTest().describeTest();
