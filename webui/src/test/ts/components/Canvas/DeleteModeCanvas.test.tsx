import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { DeleteModeCanvasMock } from "./CanvasWithMocks";
import CanvasTest from "./CanvasTest";

class DeleteModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "DeleteModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new DeleteModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {

    }
}

new DeleteModeCanvasTest().describeTest();
