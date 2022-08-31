import { FirebaseComponentModel as schema } from "database/build/export";

import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import CanvasWithMocks, { MoveModeCanvasMock } from "./CanvasWithMocks";

import CanvasTest from "./CanvasTest";
import { act } from "react-dom/test-utils";
import StockUiData from "../../../../main/ts/components/ScreenObjects/StockUiData";


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
        describe("Mode-specific tests", () => {
            this.describeClickingCanvasShouldDoNothingIfNothingSelected();
            this.describeClickCanvasDeselctsSelectedItem();
            this.describeClickingComponentShouldSelectItAndNotCreateAnything();
        });
    }

}

new MoveModeCanvasTest().describeTest();