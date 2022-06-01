import React from 'react';
import { render, fireEvent, createEvent, act } from "@testing-library/react";

import Stock, { DEFAULT_COLOR, SELECTED_COLOR, HEIGHT_PX, Props, WIDTH_PX } from "../../../../main/ts/components/Canvas/Stock";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';

const X_VALUE: number = 100;
const Y_VALUE: number = 200;
const TEXT: string = "Hello World"
const SESSION_ID: string = "0";
const COMPONENT_ID: string = "0";


function renderStock(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        initx: 0,
        inity: 0,
        sessionId: SESSION_ID,
        componentId: COMPONENT_ID,
        firebaseDataModel: { updateComponent: () => { }, subscribeToComponent: () => { },             removeComponent: () => { },
        componentCreatedListener: () => { },
        componentRemovedListener: () => { } },
        color: DEFAULT_COLOR,
        text: ""
    };
    return render(<Stock {...defaultProps} {...props} />);
}


describe("<Stock />", () => {
    test("Should display a stock with default settings", async () => {
        const { findByTestId } = renderStock({ initx: X_VALUE, inity: Y_VALUE });
        const stock = await findByTestId("stock-div");

        expect(stock).toHaveAttribute("draggable", "true");
        expect(stock).toHaveStyle({
            position: "absolute",
            left: `${X_VALUE}px`,
            top: `${Y_VALUE}px`,
            background: `${DEFAULT_COLOR}`
        });
    });

    test("Should invoke callback when dragged", async () => {
        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }

        };
        const { findByTestId } = renderStock({ firebaseDataModel: firebaseDataModel });
        const stock = await findByTestId("stock-div");

        fireEvent(stock, new MouseEvent("dragend",{ bubbles: true, cancelable: false, clientX: X_VALUE, clientY: Y_VALUE}))

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
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }
        };
        const { findByTestId } = renderStock({ firebaseDataModel });
        const stock_text = await findByTestId("stock-textfield-mui");

        fireEvent.change(stock_text, {target: {value: 'a'}})

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
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }
        };
        renderStock({ firebaseDataModel : firebaseDataModel });
        expect(subFunction).toHaveBeenCalledTimes(1);
    });

    test("Should update position when database updates", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }
        };
        const { findByTestId } = renderStock({ firebaseDataModel: firebaseDataModel });
        const stock = await findByTestId("stock-div");

        act(() => subFunction.mock.lastCall[2]({ x: X_VALUE, y: Y_VALUE, text: "" }));
        expect(stock).toHaveStyle({
            position: "absolute",
            left: `${X_VALUE}px`,
            top: `${Y_VALUE}px`,
            background: DEFAULT_COLOR
        });
    });

    test("Should update text when database updates", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }
        };
        const { getByTestId } = renderStock({ firebaseDataModel: firebaseDataModel });
        const stock_text = getByTestId("stock-textfield-mui") as HTMLInputElement;

        act( () => subFunction.mock.lastCall[2]({x: X_VALUE, y: Y_VALUE, text: TEXT}));
        expect(stock_text.value).toBe(`${TEXT}`)
    });


});
