
import {fireEvent, render} from "@testing-library/react";
import Flow, {Props} from "../../../../main/ts/components/Canvas/Flow";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { act } from 'react-dom/test-utils';
import { StockFirebaseComponent,FlowFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';
import React from "react";

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


        expect(flowSVG).toHaveStyle({
            backgroundColor: "#fff",            
        });

        expect(flowSVG).toHaveAttribute("width","0");
        expect(flowSVG).toHaveAttribute("height","0");

        expect(flowLINE).toHaveAttribute("stroke","#aaa");
        expect(flowLINE).toHaveAttribute("x1", "0");
        expect(flowLINE).toHaveAttribute("y1", "0");
        expect(flowLINE).toHaveAttribute("x2", "0");
        expect(flowLINE).toHaveAttribute("y2", "0");

        expect(flowARROWHEAD).toHaveAttribute("markerWidth","10");
        expect(flowARROWHEAD).toHaveAttribute("markerHeight","10");
        expect(flowARROWHEAD).toHaveAttribute("refX","0");
        expect(flowARROWHEAD).toHaveAttribute("refY","3");

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
        expect(subFunction).toHaveBeenCalledTimes(2);
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

        act( () => 
            subFunction.mock.lastCall[2](
                new StockFirebaseComponent(
                    TEST_COMPONENT_FROM_ID,
                    { x: TEST_X1_VALUE, y: TEST_Y1_VALUE, text: "", initvalue: "" }
                )
            )
        );

        expect(flowLINE).toHaveAttribute("x1", "101");
        expect(flowLINE).toHaveAttribute("y1", "201");
        expect(flowLINE).toHaveAttribute("x2", "1");
        expect(flowLINE).toHaveAttribute("y2", "1");

        expect(flowSVG).toHaveAttribute("width","102");
        expect(flowSVG).toHaveAttribute("height","202");

        expect(flowSVG).toHaveStyle(
            {"transform": "translate(-1px, -1px)"});


        act( () => 
            subFunction.mock.lastCall[2](
                new StockFirebaseComponent(
                    TEST_COMPONENT_TO_ID,
                    { x: TEST_X2_VALUE, y: TEST_Y2_VALUE, text: "", initvalue: "" }
                )
            )
        );

        expect(flowLINE).toHaveAttribute("x2", "476");
        expect(flowLINE).toHaveAttribute("y2", "1");
        expect(flowLINE).toHaveAttribute("x1", "1");
        expect(flowLINE).toHaveAttribute("y1", "56");

        expect(flowSVG).toHaveAttribute("width","477");
        expect(flowSVG).toHaveAttribute("height","57");
        expect(flowSVG).toHaveStyle(
            {"transform": "translate(99px, 144px)"}
        );


    })

    // test("Should update text when database updates", async () => {
    //     const subFunction = jest.fn();
    //     const firebaseDataModel: FirebaseDataModel = {
    //         subscribeToComponent: subFunction,
    //         updateComponent: () => { },
    //         removeComponent: () => { },
    //         registerComponentCreatedListener: () => { },
    //         registerComponentRemovedListener: () => { }
    //     };
    //     const { getByTestId } = renderFlow({ firebaseDataModel: firebaseDataModel });
    //     const flow_text = getByTestId("flow-textfield-mui") as HTMLInputElement;

    //     act(() =>
    //         subFunction.mock.lastCall[2](
    //             new FlowFirebaseComponent(
    //                 TEST_COMPONENT_ID,
    //                 { from: TEST_COMPONENT_FROM_ID, 
    //                    to : TEST_COMPONENT_TO_ID,
    //                    text: TEST_TEXT, 
    //                    equation: "",
    //                    dependsOn: []}
    //             )
    //         )
    //     );
    //     expect(flow_text).toBe(`${TEST_TEXT}`);
    // });

})
