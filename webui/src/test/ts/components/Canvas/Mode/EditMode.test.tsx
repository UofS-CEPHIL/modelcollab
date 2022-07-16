import React from 'react';
import { render, fireEvent } from "@testing-library/react";
import EditMode, { Props } from "../../../../../main/ts/components/Canvas/Mode/EditMode";
import { FirebaseComponentModel as schema } from "database/build/export";
import { DataContainer } from '../../../../../main/ts/data/DataContainer';

const TEST_SESSION_ID: string = "0";

const TEST_STOCK_COMPONENT_ID: string = "1";
const TEST_STOCK2_COMPONENT_ID: string = "2";
const TEST_FLOW_COMPONENT_ID: string = "99";

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;

function renderEditMode(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        open: false,
        selected: null,
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
    return render(<EditMode {...defaultProps} {...props} />);
}

describe("<EditMode />", () => {

    test("Should display Move Mode with default setting", async () => {
        const { findByTestId } = renderEditMode();
        const editMode = await findByTestId("editMode-div");

        expect(editMode).toHaveClass("draggable_container");
        expect(editMode).toHaveStyle({
            width: "100%",
            height: "1000px",
        });
    });


    test("Should invoke useState when click on the Stocks", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderEditMode(
            {
                data: new DataContainer([],
                    [new schema.StockFirebaseComponent(
                        TEST_STOCK_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                    ),
                    new schema.StockFirebaseComponent(
                        TEST_STOCK2_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                    )],
                    [new schema.FlowFirebaseComponent(
                        TEST_FLOW_COMPONENT_ID,
                        {from: TEST_STOCK_COMPONENT_ID, to: TEST_STOCK2_COMPONENT_ID, text: "", dependsOn: [""], equation: ""}
                    )])
            });

        const editMode = await findByTestId("editMode-div");

        fireEvent.click(editMode, { target: { className: "Mui_Stock", id: TEST_STOCK_COMPONENT_ID } });
        expect(setStateMock).toBeCalledWith(new schema.StockFirebaseComponent(
                                                TEST_STOCK_COMPONENT_ID,
                                                { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
        ));

        fireEvent.click(editMode, { target: { className: "Mui_Stock", id: TEST_STOCK2_COMPONENT_ID } });

        expect(setStateMock).toBeCalledWith(new schema.StockFirebaseComponent(
                                                TEST_STOCK2_COMPONENT_ID,
                                                { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
        ));
        expect(setStateMock).toBeCalledWith(true);
        jest.spyOn(React, "useState").mockRestore();
    });

    test("Should invoke useState when click on the Flow", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderEditMode(
            {
                data: new DataContainer([],
                    [new schema.StockFirebaseComponent(
                        TEST_STOCK_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                    ),
                    new schema.StockFirebaseComponent(
                        TEST_STOCK2_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                    )],
                    [new schema.FlowFirebaseComponent(
                        TEST_FLOW_COMPONENT_ID,
                        {from: TEST_STOCK_COMPONENT_ID, to: TEST_STOCK2_COMPONENT_ID, text: "", dependsOn: [""], equation: ""}
                    )])
            });

        const editMode = await findByTestId("editMode-div");

        fireEvent.click(editMode, { target: { classList: "Flow-svg", id: TEST_FLOW_COMPONENT_ID } });
        expect(setStateMock).toBeCalledWith(new schema.FlowFirebaseComponent(
                                                TEST_FLOW_COMPONENT_ID,
                                                {from: TEST_STOCK_COMPONENT_ID, to: TEST_STOCK2_COMPONENT_ID, text: "", dependsOn: [""], equation: ""}
        ));

        expect(setStateMock).toBeCalledWith(true);
        jest.spyOn(React, "useState").mockRestore();
    });

    test("Should have rendered EditBox when component is already selected", async () => {

        const {findByTestId } = renderEditMode(
            {   
                selected: new schema.StockFirebaseComponent(
                            TEST_STOCK_COMPONENT_ID,
                            { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                         ),
                open: true,
                data: new DataContainer([],
                    [new schema.StockFirebaseComponent(
                        TEST_STOCK_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                    ),
                    new schema.StockFirebaseComponent(
                        TEST_STOCK2_COMPONENT_ID,
                        { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                    )],
                    [new schema.FlowFirebaseComponent(
                        TEST_FLOW_COMPONENT_ID,
                        {from: TEST_STOCK_COMPONENT_ID, to: TEST_STOCK2_COMPONENT_ID, text: "", dependsOn: [""], equation: ""}
                    )])
            });

        const editMode = await findByTestId("editMode-div");
        const editBox = await findByTestId("editMode-EditBox-div");
        expect(editMode).toContainElement(editBox);
        expect(editMode).toContainElement(editBox);
    });
});
