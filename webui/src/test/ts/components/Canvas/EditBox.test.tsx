import { render, fireEvent, act } from "@testing-library/react";
import EditBox, { Props }from "../../../../main/ts/components/Canvas/EditBox";
import { FirebaseComponentModel as schema } from 'database/build/export';
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;
const TEST_TEXT: string = "Hello World"
const TEST_SESSION_ID: string = "0";

const TEST_COMPONENT_ID: string = "0";
const TEST_FROM_ID : string = "99";
const TEST_TO_ID : string = "88";



function renderEditBox(props: Partial<Props> = {}) {
    const defaultProps: Props = {

        sessionId: TEST_SESSION_ID,
        open: true,
        setOpen: () => {},
        component: new schema.StockFirebaseComponent(
            TEST_COMPONENT_ID, {
                x: TEST_X_VALUE,
                y: TEST_Y_VALUE,
                text: TEST_TEXT,
                initvalue: ""
            }),
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        },

    };
    return render(<EditBox{...defaultProps} {...props} />);
}


describe("<EditBox />", () => {
    test("Should display edit box with default settings", async () => {
        const { findByTestId } = renderEditBox();

        const editBox_Modal = await findByTestId("editBox-Modal");
        const editBox_Box = await findByTestId("editBox-Box");

        expect(editBox_Modal).toContainElement(editBox_Box);
        expect(editBox_Box).not.toContainElement(editBox_Modal);

        expect(editBox_Box).toHaveTextContent("Edit Stock")
        
    });

    test("Should display edit box with for flow", async () => {
        const { findByTestId } = renderEditBox({component: new schema.FlowFirebaseComponent(
                                                            TEST_COMPONENT_ID,
                                                            {from: TEST_FROM_ID, to: TEST_TO_ID, dependsOn: [""], equation: "", text: ""})});

        const editBox_Modal = await findByTestId("editBox-Modal");
        const editBox_Box = await findByTestId("editBox-Box");

        expect(editBox_Modal).toContainElement(editBox_Box);
        expect(editBox_Box).not.toContainElement(editBox_Modal);

        expect(editBox_Box).toHaveTextContent("Edit Flow")
        
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
        const { findByTestId } = renderEditBox({ firebaseDataModel });
        const edit_stock_text = await findByTestId("edit-stock-textfield-mui");

        fireEvent.change(edit_stock_text, { target: { value: 'a' } })
        expect(updateFunction).toHaveBeenCalled();
    });

    test("Should invoke callback when textfield changed", async () => {
        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { findByTestId } = renderEditBox({component: new schema.FlowFirebaseComponent(
                                                            TEST_COMPONENT_ID,
                                                            {from: TEST_FROM_ID, to: TEST_TO_ID, dependsOn: [""], equation: "", text: ""}),
                                                firebaseDataModel });

        const edit_flow_dependsOn_text = await findByTestId("edit-flow-dependsOn-textfield-mui");
        fireEvent.change(edit_flow_dependsOn_text, { target: { value: 'a' } })

        const edit_flow_equation_text = await findByTestId("edit-flow-equation-textfield-mui");
        fireEvent.change(edit_flow_equation_text, { target: { value: 'i' } })
        
        expect(updateFunction).toHaveBeenCalledTimes(2);

    });

    test("Should invoke callback when close button is clicked changed while editing Stock", async () => {
        const updateFunction = jest.fn();
        const setOpen = jest.fn()
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { findByTestId } = renderEditBox({ setOpen, firebaseDataModel});

        const edit_button = await findByTestId("editBox-Button");
        fireEvent.click(edit_button )
        
        expect(setOpen).toBeCalledWith(false);
    });

    test("Should invoke callback when close button is clicked changed while editing Stock", async () => {
        const updateFunction = jest.fn();
        const setOpen = jest.fn()
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { findByTestId } = renderEditBox({component: new schema.FlowFirebaseComponent(
                                                            TEST_COMPONENT_ID,
                                                            {from: TEST_FROM_ID, to: TEST_TO_ID, dependsOn: [""], equation: "", text: ""}),
                                                firebaseDataModel,
                                                setOpen });

        const edit_button = await findByTestId("editBox-Button");
        fireEvent.click(edit_button )
        
        expect(setOpen).toBeCalledWith(false);
    });

    test("Should subscribe to data model", async () => {
        const subFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        renderEditBox({ firebaseDataModel: firebaseDataModel });
        expect(subFunction).toHaveBeenCalledTimes(1);
    });

    test("Should update component when database updates while editing Stock", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { findByTestId } = renderEditBox({ firebaseDataModel: firebaseDataModel });
        const edit_stock_text = await findByTestId("edit-stock-textfield-mui");

        act(() =>
            subFunction.mock.lastCall[2](
                new schema.StockFirebaseComponent(
                    TEST_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "45556" }
                )
            )
        );
        expect(edit_stock_text).toHaveValue("45556")
    });

    test("Should update component when database updates while editing Flow", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { findByTestId } = renderEditBox({ component: new schema.FlowFirebaseComponent(
                                                TEST_COMPONENT_ID,
                                                {from: TEST_FROM_ID, to: TEST_TO_ID, dependsOn: [""], equation: "", text: ""}),
                                                firebaseDataModel: firebaseDataModel });

        const edit_flow_equation_text = await findByTestId("edit-flow-equation-textfield-mui");

        act(() =>
            subFunction.mock.lastCall[2](
                new schema.FlowFirebaseComponent(TEST_COMPONENT_ID,
                                                {from: TEST_FROM_ID, to: TEST_TO_ID, dependsOn: [""], equation: "Stock1 + Stock2", text: ""})
            )
        );
        expect(edit_flow_equation_text).toHaveValue("Stock1 + Stock2")
    });
});