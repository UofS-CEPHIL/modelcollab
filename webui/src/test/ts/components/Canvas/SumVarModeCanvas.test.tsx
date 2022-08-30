import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { SumVarModeCanvasMock } from "./CanvasWithMocks";

import CanvasTest from "./CanvasTest";


class SumVarModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "SumVarModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new SumVarModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {

    }

}

new SumVarModeCanvasTest().describeTest();
