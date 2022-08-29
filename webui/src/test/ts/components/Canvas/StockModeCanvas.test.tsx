//import { ReactElement } from "react";
// import StockModeCanvas from "../../../../main/ts/components/Canvas/StockModeCanvas";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasMock, { StockModeCanvasMock } from "./CanvasMock";
import CanvasTest from "./CanvasTest";

class StockModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "StockModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasMock {
        return new StockModeCanvasMock(props);
    }

    protected makeSpecificTests(): void {

    }

}

new StockModeCanvasTest().describeTest();
