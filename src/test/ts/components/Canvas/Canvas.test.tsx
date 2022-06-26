import React from 'react';
import { render, fireEvent, act } from "@testing-library/react";
import Canvas, { Props } from "../../../../main/ts/components/Canvas/Canvas";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { UiMode } from '../../../../main/ts/components/Canvas/Mode';
import { FlowFirebaseComponent, StockFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';

const TEST_SESSION_ID: string = "0";

const TEST_STOCK_COMPONENT_ID: string = "1";
const TEST_STOCK2_COMPONENT_ID: string = "2";
const TEST_STOCK3_COMPONENT_ID: string = "3";

const TEST_FLOW_COMPONENT_ID: string = "99";
const TEST_FLOW2_COMPONENT_ID: string = "88";

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;

function renderCanvas(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        user: null,
        sessionId: TEST_SESSION_ID,
        mode: UiMode.MOVE,
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        }
    };
    return render(<Canvas {...defaultProps} {...props} />);
}

describe("<Canvas />", () => {

    test("Should display Canvas with default setting", async () => {
        const { findByTestId } = renderCanvas();
        const canvas = await findByTestId("canvas-div");

        expect(canvas).toHaveClass("draggable_container");
    });

    test("Should invoke callback when on Create mode", async () => {
        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas(
            { mode: UiMode.CREATE, firebaseDataModel: firebaseDataModel }
        );
        const canvas = await findByTestId("canvas-div");

        fireEvent.click(canvas);
        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(null);
        expect(setStateMock).toBeCalledWith([]);
        expect(updateFunction).toHaveBeenCalled();

    });

    test("Should invoke useState when click on the text, when on mode Move", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ mode: UiMode.MOVE });
        const canvas = await findByTestId("canvas-div");
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "5" } });

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith([]);
        expect(setStateMock).toBeCalledWith("5");
    });

    test("Should invoke useState and callBack when click on Stocks to create new flows, when on mode Flow", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };

        const { findByTestId } = renderCanvas({ mode: UiMode.FLOW, firebaseDataModel });
        const canvas = await findByTestId("canvas-div");
        
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "5" } });

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(["5"]);

        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "6" }});

        expect(setStateMock).toBeCalledWith(["6"]);
        expect(updateFunction).toBeCalled();
    });

    test("Should invoke useState but not callBack when click on Stocks that would create existed flows, when on mode Flow", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };

        const { findByTestId } = renderCanvas({ mode: UiMode.FLOW, firebaseDataModel });
        const canvas = await findByTestId("canvas-div");
        
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "5" } });

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(["5"]);

        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "6" } });

        expect(setStateMock).toBeCalledWith(["6"]);
        
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "5" } });
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "6" } });

        expect(updateFunction).toBeCalledTimes(1);
    });

    test("Should invoke callback when on Delete mode", async () => {
        const removeFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: removeFunction,
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas(
            { mode: UiMode.DELETE, firebaseDataModel: firebaseDataModel }
        );
        const canvas = await findByTestId("canvas-div");

        fireEvent.click(canvas, { target: { className: "Mui_Stock" } });
        fireEvent.click(canvas, { target: { classList: "Flow-svg" } });

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(null);
        expect(setStateMock).toBeCalledWith([]);
        expect(removeFunction).toBeCalledTimes(2);

    });

    test("Should subscribe to data model", async () => {
        const componentCreatedFunction = jest.fn();
        const componentRemovedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentCreatedFunction,
            registerComponentRemovedListener: componentRemovedFunction
        };
        renderCanvas({ firebaseDataModel: firebaseDataModel });
        expect(componentCreatedFunction).toHaveBeenCalledTimes(1);
        expect(componentRemovedFunction).toHaveBeenCalledTimes(1);
    });

    test("Should update Stock list useState when new Stock is added to the database", async () => {
        const componentCreatedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentCreatedFunction,
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        const canvas = await findByTestId("canvas-div");

        act(() =>
            componentCreatedFunction.mock.lastCall[1](
                new StockFirebaseComponent(
                    TEST_STOCK_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                )
            )
        );

        jest.spyOn(React, "useState").mockRestore();
        expect(setStateMock).toBeCalledWith(
            [new StockFirebaseComponent(TEST_STOCK_COMPONENT_ID, { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" })]
        );
    });

    test("Should update Flow list useState when new Flow is added to the database", async () => {
        const componentCreatedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentCreatedFunction,
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        const canvas = await findByTestId("canvas-div");

        act(() =>
            componentCreatedFunction.mock.lastCall[1](
                new FlowFirebaseComponent(
                    TEST_FLOW_COMPONENT_ID,
                    {from: TEST_STOCK_COMPONENT_ID, to: TEST_STOCK2_COMPONENT_ID, text: "", dependsOn: [""], equation: "" }
                )
            )
        );

        jest.spyOn(React, "useState").mockRestore();
        expect(setStateMock).toBeCalledWith(
            [new FlowFirebaseComponent(
                TEST_FLOW_COMPONENT_ID,
                {from: TEST_STOCK_COMPONENT_ID, to: TEST_STOCK2_COMPONENT_ID, text: "", dependsOn: [""], equation: "" }
            )]
        );
    });

    test("Should update Stock list useState when Stock is deleted on the database", async () => {
        const componentRemovedFunction = jest.fn();
        const componentAddedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentAddedFunction,
            registerComponentRemovedListener: componentRemovedFunction
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: StockFirebaseComponent[]) => [
            useState,
            setStateMock
        ];

        const spy = jest.spyOn(React, "useState").mockImplementation(useStateMock);
        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });
        act(() => componentAddedFunction.mock.lastCall[1](
            new StockFirebaseComponent(
                TEST_STOCK_COMPONENT_ID,
                { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
            )
        ));
        spy.mockClear();  // Forget about adding the stock since we're testing deletion

        const canvas = await findByTestId("canvas-div");
        act(() => componentRemovedFunction.mock.lastCall[1](TEST_STOCK_COMPONENT_ID));
        expect(setStateMock).toBeCalledWith([]);
    })

    test("Should update Flow list useState when Flow is deleted on the database", async () => {
        const componentRemovedFunction = jest.fn();
        const componentAddedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentAddedFunction,
            registerComponentRemovedListener: componentRemovedFunction
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: FlowFirebaseComponent[]) => [
            useState,
            setStateMock
        ];

        const spy = jest.spyOn(React, "useState").mockImplementation(useStateMock);
        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        act(() =>
            componentAddedFunction.mock.lastCall[1](
                new FlowFirebaseComponent(
                    TEST_FLOW_COMPONENT_ID,
                    {from: TEST_STOCK_COMPONENT_ID, to: TEST_STOCK2_COMPONENT_ID, text: "", dependsOn: [""], equation: "" }
                )
            )
        );
        spy.mockClear();  // Forget about adding the stock since we're testing deletion

        const canvas = await findByTestId("canvas-div");
        act(() => componentRemovedFunction.mock.lastCall[1](TEST_FLOW_COMPONENT_ID));
        expect(setStateMock).toBeCalledWith([]);
    })

    test("Should update Flow list useState when corresponding Stock is deleted on the database", async () => {
        const removeFunction = jest.fn();
        const componentAddedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: removeFunction,
            registerComponentCreatedListener: componentAddedFunction,
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas(
            { mode: UiMode.DELETE, firebaseDataModel: firebaseDataModel }
        );

        const canvas = await findByTestId("canvas-div");  

        act(() => {
            componentAddedFunction.mock.lastCall[1](
                new StockFirebaseComponent(
                    TEST_STOCK_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
        ))});

        //     componentAddedFunction.mock.lastCall[1](
        //         new StockFirebaseComponent(
        //             TEST_STOCK2_COMPONENT_ID,
        //             { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
        //     ));
        //     componentAddedFunction.mock.lastCall[1](
        //         new StockFirebaseComponent(
        //             TEST_STOCK3_COMPONENT_ID,
        //             { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
        //     ));
        //     componentAddedFunction.mock.lastCall[1](
        //         new FlowFirebaseComponent(
        //             TEST_FLOW_COMPONENT_ID,
        //             {from: TEST_STOCK2_COMPONENT_ID, to: TEST_STOCK3_COMPONENT_ID, text: "", dependsOn: [""], equation: "" }
                
        //     ));
        //     componentAddedFunction.mock.lastCall[1](
            //     new FlowFirebaseComponent(
            //         TEST_FLOW2_COMPONENT_ID,
            //         {from: TEST_STOCK2_COMPONENT_ID, to: TEST_STOCK3_COMPONENT_ID, text: "", dependsOn: [""], equation: "" }
                
            // ));
        // });

        // act(() => componentAddedFunction.mock.lastCall[1](
        //     new StockFirebaseComponent(
        //         TEST_STOCK2_COMPONENT_ID,
        //         { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
        //     )
        // ));

        // act(() => componentAddedFunction.mock.lastCall[1](
        //     new StockFirebaseComponent(
        //         TEST_STOCK3_COMPONENT_ID,
        //         { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
        //     )
        // ));

        // act(() => componentAddedFunction.mock.lastCall[1](
        //     new FlowFirebaseComponent(
        //         TEST_FLOW_COMPONENT_ID,
        //         {from: TEST_STOCK_COMPONENT_ID, to: TEST_STOCK2_COMPONENT_ID, text: "", dependsOn: [""], equation: "" }
        //     )
        // ));

        // act(() =>
        // componentAddedFunction.mock.lastCall[1](
        //     new FlowFirebaseComponent(
        //         TEST_FLOW2_COMPONENT_ID,
        //         {from: TEST_STOCK2_COMPONENT_ID, to: TEST_STOCK3_COMPONENT_ID, text: "", dependsOn: [""], equation: "" }
        //     )
        // ));

        // const canvas = await findByTestId("canvas-div");

        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: TEST_STOCK2_COMPONENT_ID} });

        // jest.spyOn(React, "useState").mockRestore();

        // expect(setStateMock).toBeCalledWith(null);
        // expect(setStateMock).toBeCalledWith([]);

        // console.log("useState",setStateMock.mock.calls[]);
        // console.log("remove",removeFunction.mock.);

        // console.log(removeFunction.mock.);
        expect(removeFunction).toBeCalledWith();

    })
})
