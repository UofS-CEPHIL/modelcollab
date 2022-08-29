import React, { ReactElement } from "react";
// import { render, screen } from "@testing-library/react";
// import { FirebaseComponentModel as schema } from "database/build/export";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
// import StockUiData from "../../../../main/ts/components/ScreenObjects/StockUiData";
import FirebaseDataModel from "../../../../main/ts/data/FirebaseDataModel";
import StockModeCanvas from "../../../../main/ts/components/Canvas/StockModeCanvas";
import { createRoot, Root } from "react-dom/client";
import ReactDOM, { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import CanvasMock from "./CanvasMock";

/*
  This needs to be done in order to make tests with Konva behave
  properly
 */
declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;




export default abstract class CanvasTest {

    protected static AN_ID: string = "123";

    protected abstract getCanvasName(): string;

    protected abstract makeCanvasMock(props: Partial<CanvasProps>): CanvasMock;

    protected makeSpecificTests(): void { };


    public describeTest(): void {
        describe(`<${this.getCanvasName()} /> `, () => {

            var containerNode: HTMLElement | null;
            var root: Root | null;

            beforeEach(() => {
                containerNode = document.createElement("div");
                document.body.appendChild(containerNode);
                root = createRoot(containerNode);
            });

            afterEach(() => {
                if (!containerNode) throw new Error();
                act(() => root?.unmount());
                containerNode.remove();
                containerNode = null;
                root = null;
            });

            test("Empty canvas", async () => {
                const canvas = this.makeCanvasMock({});
                act(() => {
                    root?.render(canvas.render());
                });
                expect(containerNode?.innerHTML.includes("<canvas")).toBeTruthy();
                canvas.expectNoComponentsRendered();
            });


            this.makeSpecificTests();
        });
    }
}
