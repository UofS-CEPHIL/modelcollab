import React from 'react';
import { render, fireEvent } from "@testing-library/react";
import FlowMode, { Props } from "../../../../../main/ts/components/Canvas/Mode/FlowMode";
import { FlowFirebaseComponent, StockFirebaseComponent } from '../../../../../main/ts/data/FirebaseComponentModel';
import { DataContainer } from '../../../../../main/ts/data/DataContainer';
import FirebaseDataModel from '../../../../../main/ts/data/FirebaseDataModel';

const TEST_SESSION_ID: string = "0";

const TEST_STOCK_COMPONENT_ID: string = "1";
const TEST_STOCK2_COMPONENT_ID: string = "2";
const TEST_STOCK3_COMPONENT_ID: string = "3";

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;

const TEST_FLOW_COMPONENT_ID: string = "99";
const TEST_FLOW2_COMPONENT_ID: string = "88";

function renderFlowMode(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        selected: [],
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
    return render(<FlowMode {...defaultProps} {...props} />);
}

describe("<FlowMode />", () => {

    test("Should display Flow Mode with default setting", async () => {
        const { findByTestId } = renderFlowMode();
        const flowMode = await findByTestId("flowMode-div");

        expect(flowMode).toHaveClass("draggable_container");
        expect(flowMode).toHaveStyle({
            width: "100%",
            height: "1000px",
        });
    });


    test("Should invoke useState and callBack when click on Stocks to create new flow", async () => {
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

        const { findByTestId } = renderFlowMode(
            { data: new DataContainer([], 
                [new StockFirebaseComponent(
                        TEST_STOCK_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                        ),
                new StockFirebaseComponent(
                        TEST_STOCK2_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                        ),
                ],
                []), 
            firebaseDataModel,
            selected: [TEST_STOCK_COMPONENT_ID] });

        const flowMode = await findByTestId("flowMode-div");
    
        fireEvent.click(flowMode, { target: { className: "Mui_Stock", id: TEST_STOCK2_COMPONENT_ID }});
        expect(setStateMock).toBeCalledWith([TEST_STOCK_COMPONENT_ID,TEST_STOCK2_COMPONENT_ID]);
        expect(updateFunction).toBeCalledTimes(1);
        jest.spyOn(React, "useState").mockRestore();

    });

    test("Should invoke useState but NOT callBack when click on Stocks that would create existed flows", async () => {

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

        const { findByTestId } = renderFlowMode(
            { data: new DataContainer([], 
                [new StockFirebaseComponent(
                        TEST_STOCK_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                        ),
                new StockFirebaseComponent(
                        TEST_STOCK2_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                        ),
                new StockFirebaseComponent(
                        TEST_STOCK3_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                        ),
                ],
                [
                new FlowFirebaseComponent(
                    TEST_FLOW_COMPONENT_ID,
                    { to: TEST_STOCK2_COMPONENT_ID, from: TEST_STOCK_COMPONENT_ID, dependsOn: [""], text: "", equation:"" }
                    ),
                new FlowFirebaseComponent(
                    TEST_FLOW2_COMPONENT_ID,
                    { to: TEST_STOCK2_COMPONENT_ID, from: TEST_STOCK3_COMPONENT_ID, dependsOn: [""], text: "", equation:"" }
                    )                
                ]), 
            firebaseDataModel,
            selected: [TEST_STOCK_COMPONENT_ID] });

        const flowMode = await findByTestId("flowMode-div");
    
        fireEvent.click(flowMode, { target: { className: "Mui_Stock", id: TEST_STOCK2_COMPONENT_ID }});
        expect(setStateMock).toBeCalledWith([TEST_STOCK_COMPONENT_ID,TEST_STOCK2_COMPONENT_ID]);
        expect(updateFunction).toBeCalledTimes(0);
        jest.spyOn(React, "useState").mockRestore();

    });
});
