import React from 'react';
import { render, fireEvent, act } from "@testing-library/react";

import Canvas, { Props } from "../../../../main/ts/components/Canvas/Canvas";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { UiMode } from '../../../../main/ts/components/Canvas/Mode';
import { StockFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';

const TEST_SESSION_ID: string = "0";
const TEST_COMPONENT_ID: string = "1";
const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;


function renderCanvas(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        sessionId: TEST_SESSION_ID,
        mode: UiMode.MOVE,
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { },
            getAllComponentIds: async (s: string) => { return [""] },
            getAllSessionIds: async () => { return [""] },
            getComponentData: async (s: string, c: string) => {
                return new StockFirebaseComponent(
                    "",
                    {
                        x: 0,
                        y: 0,
                        text: "",
                        initvalue: ""
                    }
                );
            }
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
            registerComponentRemovedListener: () => { },
            getAllComponentIds: async (s: string) => { return [""] },
            getAllSessionIds: async () => { return [""] },
            getComponentData: async (s: string, c: string) => {
                return new StockFirebaseComponent(
                    "",
                    {
                        x: 0,
                        y: 0,
                        text: "",
                        initvalue: ""
                    }
                );
            }
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

        expect(setStateMock).toBeCalledWith("5");
    });

    test("Should invoke callback when on Delete mode", async () => {
        const removeFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: removeFunction,
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { },
            getAllComponentIds: async (s: string) => { return [""] },
            getAllSessionIds: async () => { return [""] },
            getComponentData: async (s: string, c: string) => {
                return new StockFirebaseComponent(
                    "",
                    {
                        x: 0,
                        y: 0,
                        text: "",
                        initvalue: ""
                    }
                );
            }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas(
            { mode: UiMode.DELETE, firebaseDataModel: firebaseDataModel }
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
            registerComponentCreatedListener: stockCreatedFunction,
            registerComponentRemovedListener: stockRemovedFunction,
            getAllComponentIds: async (s: string) => { return [""] },
            getAllSessionIds: async () => { return [""] },
            getComponentData: async (s: string, c: string) => {
                return new StockFirebaseComponent(
                    "",
                    {
                        x: 0,
                        y: 0,
                        text: "",
                        initvalue: ""
                    }
                );
            }
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
            registerComponentCreatedListener: stockCreatedFunction,
            registerComponentRemovedListener: () => { },
            getAllComponentIds: async (s: string) => { return [""] },
            getAllSessionIds: async () => { return [""] },
            getComponentData: async (s: string, c: string) => {
                return new StockFirebaseComponent(
                    "",
                    {
                        x: 0,
                        y: 0,
                        text: "",
                        initvalue: ""
                    }
                );
            }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        const canvas = await findByTestId("canvas-div");

        act(() =>
            stockCreatedFunction.mock.lastCall[1](
                new StockFirebaseComponent(
                    TEST_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                )
            )
        );

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(
            [new StockFirebaseComponent(TEST_COMPONENT_ID, { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" })]
        );
    });

    test("Should update Stock list useState when Stock is deleted on the database", async () => {
        const stockRemovedFunction = jest.fn();
        const stockAddedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: stockAddedFunction,
            registerComponentRemovedListener: stockRemovedFunction,
            getAllComponentIds: async (s: string) => { return [""] },
            getAllSessionIds: async () => { return [""] },
            getComponentData: async (s: string, c: string) => {
                return new StockFirebaseComponent(
                    "",
                    {
                        x: 0,
                        y: 0,
                        text: "",
                        initvalue: ""
                    }
                );
            }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: StockFirebaseComponent[]) => [
            useState,
            setStateMock
        ];

        const spy = jest.spyOn(React, "useState").mockImplementation(useStateMock);
        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });
        act(() => stockAddedFunction.mock.lastCall[1](
            new StockFirebaseComponent(
                TEST_COMPONENT_ID,
                { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
            )
        ));
        spy.mockClear();  // Forget about adding the stock since we're testing deletion

        const canvas = await findByTestId("canvas-div");
        act(() => stockRemovedFunction.mock.lastCall[1](TEST_COMPONENT_ID));
        expect(setStateMock).toBeCalledWith([]);
    })
})
