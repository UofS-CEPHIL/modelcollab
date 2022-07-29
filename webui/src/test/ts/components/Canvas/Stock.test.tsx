import React from 'react';
import { render, fireEvent, act } from "@testing-library/react";

import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { FirebaseComponentModel as schema } from 'database/build/export';

import Stock, { DEFAULT_COLOR, Props } from "../../../../main/ts/components/ScreenObjects/Stock";

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;
const TEST_TEXT: string = "Hello World"
const TEST_SESSION_ID: string = "0";
const TEST_COMPONENT_ID: string = "0";


function renderStock(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        x: 0,
        y: 0,
        sessionId: TEST_SESSION_ID,
        draggable: true,
        componentId: TEST_COMPONENT_ID,
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        },
        color: DEFAULT_COLOR,
        text: ""
    };
    return render(<Stock {...defaultProps} {...props} />);
}


describe("<Stock />", () => {
    test("Should display a stock with default settings", async () => {
        const { findByTestId } = renderStock({ x: TEST_X_VALUE, y: TEST_Y_VALUE, color: DEFAULT_COLOR });
        const stock = await findByTestId("stock-div");

        expect(stock).toHaveAttribute("draggable", "true");
        expect(stock).toHaveStyle({
            position: "absolute",
            left: `${TEST_X_VALUE}px`,
            top: `${TEST_Y_VALUE}px`,
            border: `4px solid ${DEFAULT_COLOR}`
        });
    });

    test("Should invoke callback when dragged", async () => {
        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }

        };
        const { findByTestId } = renderStock({ firebaseDataModel: firebaseDataModel });
        const stock = await findByTestId("stock-div");

        fireEvent(
            stock,
            new MouseEvent(
                "dragend",
                {
                    bubbles: true,
                    cancelable: false,
                    clientX: TEST_X_VALUE,
                    clientY: TEST_Y_VALUE
                }
            )
        );

        // not testing parameters because they are unexpectedly
        // undefined due to JSDom weirdness
        expect(updateFunction).toHaveBeenCalled();
    });

    test("Should invoke callback when text changed", async () => {
        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { findByTestId } = renderStock({ firebaseDataModel });
        const stock_text = await findByTestId("stock-textfield-mui");

        fireEvent.change(stock_text, { target: { value: 'a' } })
        expect(updateFunction).toHaveBeenCalled();
    });

    test("Should invoke useState when double click to text", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock]

        jest.spyOn(React, "useState").mockImplementation(useStateMock)

        const { findByTestId } = renderStock();
        const stock_text = await findByTestId("stock-textfield-mui")

        fireEvent.doubleClick(stock_text, new MouseEvent("dblclick"))

        jest.spyOn(React, "useState").mockRestore()
        expect(setStateMock).toHaveBeenCalledWith(false)
    })

    test("Should invoke useState when click out of text", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock]

        jest.spyOn(React, "useState").mockImplementation(useStateMock)

        const { findByTestId } = renderStock();
        const stock_text = await findByTestId("stock-textfield-mui")

        fireEvent.blur(stock_text)

        jest.spyOn(React, "useState").mockRestore()
        expect(setStateMock).toHaveBeenCalledWith(true)
    })

    test("Should subscribe to data model", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        renderStock({ firebaseDataModel: firebaseDataModel });
        expect(subFunction).toHaveBeenCalledTimes(1);
    });

    test("Should update position when database updates", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { findByTestId } = renderStock({ firebaseDataModel: firebaseDataModel });
        const stock = await findByTestId("stock-div");

        act(() =>
            subFunction.mock.lastCall[2](
                new schema.StockFirebaseComponent(
                    TEST_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                )
            )
        );
        expect(stock).toHaveStyle({
            position: "absolute",
            left: `${TEST_X_VALUE}px`,
            top: `${TEST_Y_VALUE}px`,
            border: `4px solid ${DEFAULT_COLOR}`
        });
    });

    test("Should update text when database updates", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { getByTestId } = renderStock({ firebaseDataModel: firebaseDataModel });
        const stock_text = getByTestId("stock-textfield-mui") as HTMLInputElement;

        act(() =>
            subFunction.mock.lastCall[2](
                new schema.StockFirebaseComponent(
                    TEST_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: TEST_TEXT, initvalue: "" }
                )
            )
        );
        expect(stock_text.value).toBe(`${TEST_TEXT}`)
    });
});
