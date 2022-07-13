import {fireEvent, render} from "@testing-library/react";
import Flow, {Props} from "../../../../main/ts/components/Canvas/Flow";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { act } from 'react-dom/test-utils';
import { StockFirebaseComponent,FlowFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';

const TEST_COMPONENT_ID: string = "1";
const TEST_SESSION_ID: string = "0";

const TEST_COMPONENT_FROM_ID: string = "10";
const TEST_COMPONENT_TO_ID: string = "20";

const TEST_TEXT: string = "New flow text";

const TEST_X1_VALUE: number = 100;
const TEST_Y1_VALUE: number = 200;

const TEST_X2_VALUE: number = 575;
const TEST_Y2_VALUE: number = 145;

// const TEST_FROM: stockInfo = {id: TEST_COMPONENT_FROM_ID, x: 20, y: 20};
// const TEST_TO: stockInfo =   {id: TEST_COMPONENT_TO_ID, x: 100,y: 100};

function renderFlow(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        sessionId: TEST_SESSION_ID,
        componentId: TEST_COMPONENT_ID,
        text: "",
        from: TEST_COMPONENT_FROM_ID,
        to: TEST_COMPONENT_TO_ID,
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        },
        equation: "",
        dependsOn: [],
    };
    return render(<Flow {...defaultProps} {...props} />);
}

describe("<Flow />", () => {
    test("Should display Flow with default settings", async () => {
        const {findByTestId} = renderFlow();

        const flowSVG = await findByTestId("flow-svg");
        const flowLINE = await findByTestId("flow-line");
        const flowARROWHEAD = await findByTestId("flow-arrowhead");
        const flowTextDiv = await findByTestId("flow-text-div");
  
        expect(flowSVG).toHaveStyle({
            backgroundColor: "transparent",            
        });

        expect(flowSVG).toHaveAttribute("width","0");
        expect(flowSVG).toHaveAttribute("height","0");

        expect(flowLINE).toHaveAttribute("stroke","black");
        expect(flowLINE).toHaveAttribute("x1", "0");
        expect(flowLINE).toHaveAttribute("y1", "0");
        expect(flowLINE).toHaveAttribute("x2", "0");
        expect(flowLINE).toHaveAttribute("y2", "0");

        expect(flowARROWHEAD).toHaveAttribute("markerWidth","10");
        expect(flowARROWHEAD).toHaveAttribute("markerHeight","10");
        expect(flowARROWHEAD).toHaveAttribute("refX","0");
        expect(flowARROWHEAD).toHaveAttribute("refY","3");

        expect(flowTextDiv).toHaveStyle({
            position: "absolute",
            left: "0px",
            top: "0px",
        });

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
        expect(subFunction).toHaveBeenCalledTimes(3);
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
        const flowSVG = await findByTestId("flow-svg");
        const flowTextDiv = await findByTestId("flow-text-div");

        act( () => 
            subFunction.mock.lastCall[2](
                new StockFirebaseComponent(
                    TEST_COMPONENT_FROM_ID,
                    { x: TEST_X1_VALUE, y: TEST_Y1_VALUE, text: "", initvalue: "" }
                )
            )
        );

        expect(flowLINE).toHaveAttribute("x1", "170");
        expect(flowLINE).toHaveAttribute("y1", "150");
        expect(flowLINE).toHaveAttribute("x2", "70");
        expect(flowLINE).toHaveAttribute("y2", "70");

        expect(flowSVG).toHaveAttribute("width","240");
        expect(flowSVG).toHaveAttribute("height","220");

        expect(flowSVG).toHaveStyle(
            {"transform": "translate(-20px, 85px)"});

        
        expect(flowTextDiv).toHaveStyle({
                position: "absolute",
                left: "20px",
                top: "195px",
        });

        act( () => 
            subFunction.mock.lastCall[2](
                new StockFirebaseComponent(
                    TEST_COMPONENT_TO_ID,
                    { x: TEST_X2_VALUE, y: TEST_Y2_VALUE, text: "", initvalue: "" }
                )
            )
        );

        expect(flowLINE).toHaveAttribute("x2", "425");
        expect(flowLINE).toHaveAttribute("y2", "70");
        expect(flowLINE).toHaveAttribute("x1", "70");
        expect(flowLINE).toHaveAttribute("y1", "125");

        expect(flowSVG).toHaveAttribute("width","495");
        expect(flowSVG).toHaveAttribute("height","195");
        expect(flowSVG).toHaveStyle(
            {"transform": "translate(80px, 110px)"}
        );

        expect(flowTextDiv).toHaveStyle({
            position: "absolute",
            left: "247.5px",
            top: "184.5px",
        });

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
        expect(flow_text.value).toBe(`${TEST_TEXT}`);
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
        const flow_text = await findByTestId("flow-textfield-mui");

        fireEvent.change(flow_text, { target: { value: 'a' } })
        expect(updateFunction).toHaveBeenCalled();
    });

})
