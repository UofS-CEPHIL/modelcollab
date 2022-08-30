import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { ParameterModeCanvasMock } from "./CanvasWithMocks";

import CanvasTest from "./CanvasTest";


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

    }

}

new ParameterModeCanvasTest().describeTest();
