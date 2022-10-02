import { FirebaseComponentModel as schema } from "database/build/export";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import MockCanvas, { DeleteModeCanvasSpy } from "./MockCanvas";
import CanvasTest from "./CanvasTest";
import StockUiData from "../../../../main/ts/components/Canvas/ScreenObjects/Stock/StockUiData";
import { act } from "react-dom/test-utils";
import ComponentCollection from "../../../../main/ts/components/Canvas/ComponentCollection";

class DeleteModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "DeleteModeCanvas";
    }

    protected makeCanvasMock(props: Partial<CanvasProps>): MockCanvas {
        return new DeleteModeCanvasSpy(props);
    }

    protected shouldShowConnectionHandles(): boolean {
        return false;
    }

    protected makeSpecificTests(): void {
        describe("Mode-specific tests", () => {
            this.describeClickingCanvasShouldDoNothingIfNothingSelected();

            test("Clicking a component should delete it", async () => {
                const component = new StockUiData(
                    new schema.StockFirebaseComponent(
                        "123123",
                        {
                            x: 0,
                            y: 0,
                            text: "",
                            initvalue: ""
                        }
                    )
                );
                const canvas = this.makeCanvasMock({ selectedComponentIds: [], components: new ComponentCollection([component]) });
                act(() => this.root?.render(canvas.render()));

                act(() => canvas.clickComponent(component));
                expect(canvas.deleteComponentSpy).toHaveBeenCalledTimes(1);
                expect(canvas.deleteComponentSpy).toHaveBeenLastCalledWith(component.getId());
            });
        });
    }
}

new DeleteModeCanvasTest().describeTest();
