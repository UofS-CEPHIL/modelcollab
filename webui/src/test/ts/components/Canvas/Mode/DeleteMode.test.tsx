import { render, fireEvent } from "@testing-library/react";
import DeleteMode, { Props } from "../../../../../main/ts/components/Canvas/DeleteModeCanvas";
import FirebaseDataModel from '../../../../../main/ts/data/FirebaseDataModel';
import { DataContainer } from '../../../../../main/ts/data/DataContainer';
import { FirebaseComponentModel as schema } from "database/build/export";

const TEST_SESSION_ID: string = "0";

const TEST_STOCK_COMPONENT_ID: string = "1";
const TEST_STOCK2_COMPONENT_ID: string = "2";
const TEST_STOCK3_COMPONENT_ID: string = "3";
const TEST_STOCK4_COMPONENT_ID: string = "4";

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;

const TEST_FLOW_COMPONENT_ID: string = "99";
const TEST_FLOW2_COMPONENT_ID: string = "88";
const TEST_FLOW3_COMPONENT_ID: string = "77";

function renderDeleteMode(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        data: new DataContainer(),
        sessionId: TEST_SESSION_ID,
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { },
        }
    };
    return render(<DeleteMode {...defaultProps} {...props} />);
}

describe("<DeleteMode />", () => {

    test("Should display DeleteMode with default setting", async () => {
        const { findByTestId } = renderDeleteMode();
        const deleteMode = await findByTestId("deleteMode-div");

        expect(deleteMode).toHaveClass("draggable_container");
        expect(deleteMode).toHaveStyle({
            width: "100%",
            height: "1000px",
        });
    });

    test("Should invoke removeComponent when delete Flows", async () => {
        const removeFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: removeFunction,
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { },
        };

        const { findByTestId } = renderDeleteMode({
            data: new DataContainer([],
                [new schema.StockFirebaseComponent(
                    TEST_STOCK_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                new schema.StockFirebaseComponent(
                    TEST_STOCK2_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                new schema.StockFirebaseComponent(
                    TEST_STOCK3_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                )
                ],
                [new schema.FlowFirebaseComponent(
                    TEST_FLOW_COMPONENT_ID,
                    { to: TEST_STOCK_COMPONENT_ID, from: TEST_STOCK2_COMPONENT_ID, dependsOn: [""], text: "", equation: "" }
                ),
                new schema.FlowFirebaseComponent(
                    TEST_FLOW2_COMPONENT_ID,
                    { to: TEST_STOCK2_COMPONENT_ID, from: TEST_STOCK3_COMPONENT_ID, dependsOn: [""], text: "", equation: "" }
                )
                ]),
            firebaseDataModel: firebaseDataModel
        });

        const deleteMode = await findByTestId("deleteMode-div");

        fireEvent.click(deleteMode, { target: { classList: "Flow-svg", id: TEST_FLOW_COMPONENT_ID } });
        expect(removeFunction).toHaveBeenCalledTimes(1);
        expect(removeFunction).toHaveBeenCalledWith("0", TEST_FLOW_COMPONENT_ID);

        fireEvent.click(deleteMode, { target: { classList: "Flow-svg", id: TEST_FLOW2_COMPONENT_ID } });
        expect(removeFunction).toHaveBeenCalledTimes(2);
        expect(removeFunction).toHaveBeenCalledWith("0", TEST_FLOW2_COMPONENT_ID);

    });

    test("Should invoke removeComponent when delete Stocks", async () => {
        const removeFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: removeFunction,
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { },
        };

        const { findByTestId } = renderDeleteMode({
            data: new DataContainer([],
                [new schema.StockFirebaseComponent(
                    TEST_STOCK_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                new schema.StockFirebaseComponent(
                    TEST_STOCK2_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                new schema.StockFirebaseComponent(
                    TEST_STOCK3_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                new schema.StockFirebaseComponent(
                    TEST_STOCK4_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                ],
                [new schema.FlowFirebaseComponent(
                    TEST_FLOW_COMPONENT_ID,
                    { to: TEST_STOCK_COMPONENT_ID, from: TEST_STOCK2_COMPONENT_ID, dependsOn: [""], text: "", equation: "" }
                ),
                ]),
            firebaseDataModel: firebaseDataModel
        });

        const deleteMode = await findByTestId("deleteMode-div");

        fireEvent.click(deleteMode, { target: { className: "Mui_Stock", id: TEST_STOCK3_COMPONENT_ID } });
        expect(removeFunction).toHaveBeenCalledTimes(1);
        expect(removeFunction).toHaveBeenCalledWith("0", TEST_STOCK3_COMPONENT_ID);

        fireEvent.click(deleteMode, { target: { className: "Mui_Stock", id: TEST_STOCK4_COMPONENT_ID } });
        expect(removeFunction).toHaveBeenCalledTimes(2);
        expect(removeFunction).toHaveBeenCalledWith("0", TEST_STOCK4_COMPONENT_ID);

    });

    test("Should invoke removeComponent when delete Stock that are connecting to Flows", async () => {
        const removeFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: removeFunction,
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { },
        };

        const { findByTestId } = renderDeleteMode({
            data: new DataContainer([],
                [new schema.StockFirebaseComponent(
                    TEST_STOCK_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                new schema.StockFirebaseComponent(
                    TEST_STOCK2_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                new schema.StockFirebaseComponent(
                    TEST_STOCK3_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                new schema.StockFirebaseComponent(
                    TEST_STOCK4_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                ),
                ],
                [new schema.FlowFirebaseComponent(
                    TEST_FLOW_COMPONENT_ID,
                    { to: TEST_STOCK_COMPONENT_ID, from: TEST_STOCK2_COMPONENT_ID, dependsOn: [""], text: "", equation: "" }
                ),
                new schema.FlowFirebaseComponent(
                    TEST_FLOW2_COMPONENT_ID,
                    { to: TEST_STOCK2_COMPONENT_ID, from: TEST_STOCK3_COMPONENT_ID, dependsOn: [""], text: "", equation: "" }
                ),
                new schema.FlowFirebaseComponent(
                    TEST_FLOW3_COMPONENT_ID,
                    { to: TEST_STOCK2_COMPONENT_ID, from: TEST_STOCK4_COMPONENT_ID, dependsOn: [""], text: "", equation: "" }
                )
                ]),
            firebaseDataModel: firebaseDataModel
        });

        const deleteMode = await findByTestId("deleteMode-div");

        fireEvent.click(deleteMode, { target: { className: "Mui_Stock", id: TEST_STOCK2_COMPONENT_ID } });
        expect(removeFunction).toHaveBeenCalledTimes(4);
        expect(removeFunction).toHaveBeenCalledWith("0", TEST_STOCK2_COMPONENT_ID);
        expect(removeFunction).toHaveBeenCalledWith("0", TEST_FLOW_COMPONENT_ID);
        expect(removeFunction).toHaveBeenCalledWith("0", TEST_FLOW2_COMPONENT_ID);
        expect(removeFunction).toHaveBeenCalledWith("0", TEST_FLOW3_COMPONENT_ID);
    });
});
