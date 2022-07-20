import React from 'react';
import { render, fireEvent } from "@testing-library/react";
import MoveMode, { Props } from "../../../../../main/ts/components/Canvas/MoveModeCanvas";
import { FirebaseComponentModel as schema } from "database/build/export";
import { DataContainer } from '../../../../../main/ts/data/DataContainer';

const TEST_SESSION_ID: string = "0";

const TEST_STOCK_COMPONENT_ID: string = "1";
const TEST_STOCK2_COMPONENT_ID: string = "2";

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;

function renderMoveMode(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        data: new DataContainer(),
        sessionId: TEST_SESSION_ID,
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        }
    };
    return render(<MoveMode {...defaultProps} {...props} />);
}

describe("<MoveMode />", () => {

    test("Should display Move Mode with default setting", async () => {
        const { findByTestId } = renderMoveMode();
        const moveMode = await findByTestId("moveMode-div");

        expect(moveMode).toHaveClass("draggable_container");
        expect(moveMode).toHaveStyle({
            width: "100%",
            height: "1000px",
        });
    });


    test("Should invoke useState when click on the text", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderMoveMode(
            {
                data: new DataContainer([],
                    [new schema.StockFirebaseComponent(
                        TEST_STOCK_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                    ),
                    new schema.StockFirebaseComponent(
                        TEST_STOCK2_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                    )])
            });

        const moveMode = await findByTestId("moveMode-div");
        fireEvent.click(moveMode, { target: { className: "Mui_Stock", id: "5" } });
        expect(setStateMock).toBeCalledWith("5");

        fireEvent.click(moveMode, { target: { className: "Mui_Stock", id: TEST_STOCK_COMPONENT_ID } });
        expect(setStateMock).toBeCalledWith(TEST_STOCK_COMPONENT_ID);

        fireEvent.click(moveMode, { target: { className: "Mui_Stock", id: TEST_STOCK2_COMPONENT_ID } });
        expect(setStateMock).toBeCalledWith(TEST_STOCK2_COMPONENT_ID);

        jest.spyOn(React, "useState").mockRestore();
    });
});
