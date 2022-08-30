import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { ConnectionModeCanvasMock } from "./CanvasWithMocks";

import CanvasTest from "./CanvasTest";


class ConnectModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "ConnectModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new ConnectionModeCanvasMock({ ...props, showConnectionHandles: this.shouldShowConnectionHandles() });
    }

    protected shouldShowConnectionHandles(): boolean {
        return true;
    }

    protected makeSpecificTests(): void {

    }

}

new ConnectModeCanvasTest().describeTest();
