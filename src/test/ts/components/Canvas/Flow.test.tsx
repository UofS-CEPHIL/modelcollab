
import {fireEvent, render} from "@testing-library/react";
import Flow, {Props} from "../../../../main/ts/components/Canvas/Flow";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { act } from 'react-dom/test-utils';
import { StockFirebaseComponent,FlowFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';

const TEST_COMPONENT_ID: string = "90";

const TEST_COMPONENT_FROM_ID: string = "10";
const TEST_COMPONENT_TO_ID: string = "20";

const TEST_TEXT: string = "New flow text";

const TEST_X1_VALUE: number = 200;
const TEST_Y1_VALUE: number = 200;

const TEST_X2_VALUE: number = 500;
const TEST_Y2_VALUE: number = 500;

// const TEST_FROM: stockInfo = {id: TEST_COMPONENT_FROM_ID, x: 20, y: 20};
// const TEST_TO: stockInfo =   {id: TEST_COMPONENT_TO_ID, x: 100,y: 100};

function renderFlow(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        text: "",
        from: "0",
        to: "1",
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        },
        equation: "",
        dependsOn: []
    };
    return render(<Flow {...defaultProps} {...props} />);
}

describe("<Flow />", () => {
    test("Should display Flow with default settings", async () => {
        const {findByTestId} = renderFlow();

        const flowSVG = await findByTestId("flow-svg");
        const flowARROW = await findByTestId("flow-line");

        expect(flowSVG).toHaveStyle({
            backgroundColor: "#eee",            
        });
        
        expect(flowARROW).toHaveAttribute("stroke","#aaa");
        expect(flowARROW).toHaveAttribute("strokeWidth",1);
    });

    test("Should subcribe to data model", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        renderFlow({ firebaseDataModel: firebaseDataModel });
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
        
        const { findByTestId } = renderFlow( { firebaseDataModel: firebaseDataModel });
        const flowLINE = await findByTestId("flow-line");

        act( () => 
            subFunction.mock.lastCall[2](
                new StockFirebaseComponent(
                    TEST_COMPONENT_FROM_ID,
                    { x: TEST_X1_VALUE, y: TEST_Y1_VALUE, text: "", initvalue: "" }
                )
            )
        );

        expect(flowLINE).toHaveAttribute("x1", TEST_X1_VALUE);
        expect(flowLINE).toHaveAttribute("y1", TEST_Y1_VALUE);

        act( () => 
            subFunction.mock.lastCall[2](
                new StockFirebaseComponent(
                    TEST_COMPONENT_TO_ID,
                    { x: TEST_X2_VALUE, y: TEST_Y2_VALUE, text: "", initvalue: "" }
                )
            )
        );

        expect(flowLINE).toHaveAttribute("x2", TEST_X2_VALUE);
        expect(flowLINE).toHaveAttribute("y2", TEST_Y2_VALUE);
    })

    test("Should update text when database updates", async () => {
        const subFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: subFunction,
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };
        const { getByTestId } = renderFlow({ firebaseDataModel: firebaseDataModel });
        const flow_text = getByTestId("flow-textfield-mui") as HTMLInputElement;

        act(() =>
            subFunction.mock.lastCall[2](
                new FlowFirebaseComponent(
                    TEST_COMPONENT_ID,
                    { from: TEST_COMPONENT_FROM_ID, 
                       to : TEST_COMPONENT_TO_ID,
                       text: TEST_TEXT, 
                       equation: "",
                       dependsOn: []}
                )
            )
        );
        expect(flow_text).toBe(`${TEST_TEXT}`);
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
        const { findByTestId } = renderFlow({ firebaseDataModel });
        const flow_text = await findByTestId("flow-text");

        fireEvent.change(flow_text, { target: { value: 'a' } });
        expect(updateFunction).toHaveBeenCalled();
    });

    
})
