import React from 'react';
import { render, fireEvent, createEvent, act } from "@testing-library/react";

import Stock, { DEFAULT_COLOR, HEIGHT_PX, Props, WIDTH_PX } from "../../../main/ts/components/Canvas/Stock";
import FirebaseDataModel from '../../../main/ts/data/FirebaseDataModel';


const X_VALUE: number = 100;
const Y_VALUE: number = 200;
const SESSION_ID: string = "0";
const COMPONENT_ID: string = "0";


function renderStock(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        initx: 0,
        inity: 0,
        sessionId: SESSION_ID,
        componentId: COMPONENT_ID,
        firebaseDataModel: { updateComponent: () => { }, subscribeToComponent: () => { } }
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
            width: `${WIDTH_PX}px`,
            height: `${HEIGHT_PX}px`,
            background: DEFAULT_COLOR
        });
    });

    test("Should invoke callback when dragged", async () => {
        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction
        };
        const { findByTestId } = renderStock({ firebaseDataModel });
        const stock = await findByTestId("stock-div");

        fireEvent.dragEnd(stock, new MouseEvent('dragend'));

        // not testing parameters because they are unexpectedly
        // undefined due to JSDom weirdness
        expect(updateFunction).toHaveBeenCalled();
    });

    test("Should subscribe to data model", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { }
        };
        renderStock({ firebaseDataModel });
        expect(subFunction).toHaveBeenCalledTimes(1);
    });

    test("Should update position when database updates", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { }
        };
        const { findByTestId } = renderStock({ firebaseDataModel });
        const stock = await findByTestId("stock-div");
        act(() => subFunction.mock.lastCall[2]({ x: X_VALUE, y: Y_VALUE, text: "" }));
        expect(stock).toHaveStyle({
            position: "absolute",
            left: `${X_VALUE}px`,
            top: `${Y_VALUE}px`,
            width: `${WIDTH_PX}px`,
            height: `${HEIGHT_PX}px`,
            background: DEFAULT_COLOR
        });
    });
});
