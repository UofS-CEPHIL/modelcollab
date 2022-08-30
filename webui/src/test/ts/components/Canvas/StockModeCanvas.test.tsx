import { fireEvent, getByRole } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import StockUiData from "../../../../main/ts/components/ScreenObjects/StockUiData";
import CanvasWithMocks, { StockModeCanvasMock } from "./CanvasWithMocks";
import CanvasTest from "./CanvasTest";

class StockModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "StockModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): CanvasWithMocks {
        return new StockModeCanvasMock(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {

    }

}

new StockModeCanvasTest().describeTest();
