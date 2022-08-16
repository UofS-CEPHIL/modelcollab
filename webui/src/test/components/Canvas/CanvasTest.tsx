import { ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { FirebaseComponentModel as schema } from "database/build/export";
import BaseCanvas, { Props as CanvasProps } from "../../../main/ts/components/Canvas/BaseCanvas";
import StockUiData from "../../../main/ts/components/ScreenObjects/StockUiData";
import FirebaseDataModel from "../../../main/ts/data/FirebaseDataModel";

export const NO_OP = () => { };

export default abstract class CanvasTest {

    protected static AN_ID: string = "123";

    protected abstract makeCanvas(props: Partial<CanvasProps>): ReactElement;

    protected abstract getCanvasName(): string;

    protected makeSpecificTests(): void { };


    public describeTest(): void {
        describe(`<${this.getCanvasName()} />`, () => {

            test("Empty canvas", async () => {
                render(this.makeCanvas({}));
                const canvas = screen.getByTestId("CanvasStage");
                expect(canvas).toBeDefined();
            });

            test("Find a stock", async () => {
                const stock = new StockUiData(
                    new schema.StockFirebaseComponent(
                        CanvasTest.AN_ID,
                        { x: 0, y: 0, text: "stock", initvalue: "123" }
                    )
                );
                const canvas = this.makeCanvas({
                    children: [stock]
                });
                render(canvas);
                const stockHtmlElement = screen.getByTestId("stock-" + CanvasTest.AN_ID);
                expect(stockHtmlElement).toBeDefined();
            });

            this.makeSpecificTests();
        });
    }

    protected makeFirebaseDataModel(mockFuncs?: Partial<FirebaseDataModel>): FirebaseDataModel {
        const emptyDataModel: FirebaseDataModel = {
            updateComponent: NO_OP,
            subscribeToComponent: NO_OP,
            subscribeToSession: NO_OP,
            subscribeToSessionList: NO_OP,
            addSession: NO_OP,
            removeComponent: NO_OP,
            registerComponentCreatedListener: NO_OP,
            registerComponentRemovedListener: NO_OP
        };
        return { ...emptyDataModel, ...mockFuncs };
    }
}
