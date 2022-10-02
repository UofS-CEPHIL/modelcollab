import { act } from "react-dom/test-utils";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import StockUiData from "../../../../main/ts/components/Canvas/ScreenObjects/Stock/StockUiData";
import MockCanvas, { StockModeCanvasSpy } from "./MockCanvas";
import CanvasTest from "./CanvasTest";

class StockModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "StockModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): MockCanvas {
        return new StockModeCanvasSpy(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {
            this.describeClickingComponentShouldSelectItAndNotCreateAnything();

            test("Clicking on canvas should create new stock", async () => {
                const x = 15;
                const y = 15;
                const canvas = this.makeCanvasMock({});
                act(() => this.root?.render(canvas.render()));
                canvas.leftClickCanvas(x, y);
                expect(canvas.addComponentSpy).toHaveBeenCalledTimes(1);
                const stock = canvas.addComponentSpy?.mock.lastCall[0] as StockUiData;
                expect(stock).toBeDefined();
                expect(stock.getData().x).toBe(x);
                expect(stock.getData().y).toBe(y);
            });
        });
    }

}

new StockModeCanvasTest().describeTest();
