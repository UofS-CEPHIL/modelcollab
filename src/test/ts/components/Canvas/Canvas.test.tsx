import React from 'react';
import { render, fireEvent, act } from "@testing-library/react";
import Canvas, { Props } from "../../../../main/ts/components/Canvas/Canvas";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { UiMode } from '../../../../main/ts/components/Canvas/Mode';
import { FlowFirebaseComponent, StockFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';

const TEST_SESSION_ID: string = "0";

const TEST_STOCK_COMPONENT_ID: string = "1";
const TEST_STOCK2_COMPONENT_ID: string = "2";

const TEST_FLOW_COMPONENT_ID: string = "99";

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

    test("Should invoke useState when click on a stock, when on mode Flow", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ mode: UiMode.FLOW});
        const canvas = await findByTestId("canvas-div");
        
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "5" } });
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "6" }});

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(["5"]);
        expect(setStateMock).toBeCalledWith(["6"]);

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
        const useStateMock: any = (useState: StockFirebaseComponent[]) => [useState, setStateMock];

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
})
