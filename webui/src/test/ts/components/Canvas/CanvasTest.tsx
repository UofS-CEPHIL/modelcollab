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


export const NO_OP = () => { };

declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export default abstract class CanvasTest {

    protected static AN_ID: string = "123";

    protected makeCanvasSpy(props: Partial<CanvasProps>): ReactElement {
        const DEFAULT_PROPS: any = {
            firebaseDataModel: this.makeFirebaseDataModel(),
            selectedComponentId: null,
            sessionId: CanvasTest.AN_ID,
            children: [],
            editComponent: NO_OP,
            deleteComponent: NO_OP,
            addComponent: NO_OP,
            setSelected: NO_OP
        };
        return (
            <StockModeCanvas
                {...{ ...DEFAULT_PROPS, ...props }}
            />
        );
    }

    protected abstract getCanvasName(): string;

    protected makeSpecificTests(): void { };


    public describeTest(): void {
        describe(`<${this.getCanvasName()} />`, () => {

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
                const canvasElem = this.makeCanvasSpy({});
                act(() => {
                    root?.render(canvasElem);
                });
                expect(containerNode?.innerHTML.includes("<canvas")).toBeTruthy();
            });

            // test("Find a stock", async () => {
            //     const stock = new StockUiData(
            //         new schema.StockFirebaseComponent(
            //             CanvasTest.AN_ID,
            //             { x: 0, y: 0, text: "stock", initvalue: "123" }
            //         )
            //     );
            //     const canvas = this.makeCanvas({
            //         children: [stock]
            //     });
            //     render(canvas);
            //     const stockHtmlElement = screen.getByTestId("stock-" + CanvasTest.AN_ID);
            //     expect(stockHtmlElement).toBeDefined();
            // });

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
