import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { MoveModeCanvasMock } from "./CanvasWithMocks";

import CanvasTest from "./CanvasTest";


class MoveModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "MoveModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new MoveModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {

    }

}

new MoveModeCanvasTest().describeTest();
