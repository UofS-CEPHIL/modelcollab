import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { VariableModeCanvasMock } from "./CanvasWithMocks";

import CanvasTest from "./CanvasTest";


class DynVarModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "DynVarModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new VariableModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {

    }

}

new DynVarModeCanvasTest().describeTest();
