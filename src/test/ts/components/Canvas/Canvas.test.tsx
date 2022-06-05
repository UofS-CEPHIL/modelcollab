import React from 'react';
import { render, fireEvent, act } from "@testing-library/react";

import Canvas, { Props, Mode } from "../../../../main/ts/components/Canvas/Canvas";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';

const TEST_SESSION_ID: string = "0";
const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;


function renderCanvas(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        user: null,
        sessionId: TEST_SESSION_ID,
        mode: Mode.MOVE,
        firebaseDataModel: {
            updateComponent: () => { }, subscribeToComponent: () => { }, removeComponent: () => { },
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }
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
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas(
            { mode: Mode.CREATE, firebaseDataModel: firebaseDataModel }
        );
        const canvas = await findByTestId("canvas-div");

        fireEvent.click(canvas);
        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(null);
        expect(updateFunction).toHaveBeenCalled();

    });

    test("Should invoke useState when click on the text, when on mode Move", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ mode: Mode.MOVE });
        const canvas = await findByTestId("canvas-div");
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "5" } });

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith("5");
    });

    test("Should invoke callback when on Delete mode", async () => {
        const removeFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: removeFunction,
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas(
            { mode: Mode.DELETE, firebaseDataModel: firebaseDataModel }
        );
        const canvas = await findByTestId("canvas-div");

        fireEvent.click(canvas, { target: { className: "Mui_Stock" } });

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(null);
        expect(removeFunction).toBeCalled();
    });

    test("Should subscribe to data model", async () => {
        const stockCreatedFunction = jest.fn();
        const stockRemovedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            componentCreatedListener: stockCreatedFunction,
            componentRemovedListener: stockRemovedFunction
        };
        renderCanvas({ firebaseDataModel: firebaseDataModel });
        expect(stockCreatedFunction).toHaveBeenCalledTimes(1);
        expect(stockRemovedFunction).toHaveBeenCalledTimes(1);
    });


    test("Should update Stock list useState when new Stock is added to the database", async () => {
        const stockCreatedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            componentCreatedListener: stockCreatedFunction,
            componentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock]
        jest.spyOn(React, "useState").mockImplementation(useStateMock)

        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        const canvas = await findByTestId("canvas-div");

        act(() =>
            stockCreatedFunction.mock.lastCall[1](1, { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "" })
        );

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(
            [{ stock: { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "" }, id: "1" }]
        );
    });

    test("Should update Stock list useState when Stock is deleted on the database", async () => {
        const stockRemovedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            componentCreatedListener: () => { },
            componentRemovedListener: stockRemovedFunction
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [
            useState = [
                {
                    stock: {
                        x: TEST_X_VALUE,
                        y: TEST_Y_VALUE,
                        text: ""
                    },
                    id: "1"
                }
            ],
            setStateMock
        ];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);
        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        const canvas = await findByTestId("canvas-div");

        act(() => stockRemovedFunction.mock.lastCall[1]("1"))
        expect(setStateMock).toBeCalledWith([])
    })
})
