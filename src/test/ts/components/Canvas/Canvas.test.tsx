import React from 'react';
import { render, act, getByTestId } from "@testing-library/react";
import Canvas, { Props } from "../../../../main/ts/components/Canvas/Canvas";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { UiMode } from '../../../../main/ts/components/Canvas/Mode/Mode';
import { FlowFirebaseComponent, StockFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';

const TEST_SESSION_ID: string = "0";

const TEST_STOCK_COMPONENT_ID: string = "1";
const TEST_STOCK2_COMPONENT_ID: string = "2";

const TEST_FLOW_COMPONENT_ID: string = "99";

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;

function renderCanvas(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        sessionId: TEST_SESSION_ID,
        mode: UiMode.MOVE,
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        }
    };
    return render(<Canvas {...defaultProps} {...props} />);
}

describe("<Canvas />", () => {

    test("Should display Canvas with default setting (render Move Mode)", async () => {
        const { findByTestId} = renderCanvas();
        const canvas = await findByTestId("canvas-div");
        const moveMode = await findByTestId("canvas-moveMode-div");

        expect(canvas).toContainElement(moveMode);
        expect(moveMode).not.toContainElement(canvas);

    });

    test("Should display Canvas with Create Mode", async () => {
        const {findByTestId} = renderCanvas( {mode: UiMode.CREATE} );
        const canvas = await findByTestId("canvas-div");
        const createMode = await findByTestId("canvas-createMode-div");

        expect(canvas).toContainElement(createMode);
        expect(createMode).not.toContainElement(canvas);

    })

    test("Should display Canvas with Delete Mode", async () => {
        const {findByTestId} = renderCanvas( {mode: UiMode.DELETE} );
        const canvas = await findByTestId("canvas-div");
        const deleteMode = await findByTestId("canvas-deleteMode-div");

        expect(canvas).toContainElement(deleteMode);
        expect(deleteMode).not.toContainElement(canvas);

    })

    test("Should display Canvas with Flow Mode", async () => {
        const {findByTestId} = renderCanvas( {mode: UiMode.FLOW} );
        const canvas = await findByTestId("canvas-div");
        const flowMode = await findByTestId("canvas-flowMode-div");

        expect(canvas).toContainElement(flowMode);
        expect(flowMode).not.toContainElement(canvas);

    })

    test("Should display Canvas with Edit Mode", async () => {
        const {findByTestId} = renderCanvas( {mode: UiMode.EDIT} );
        const canvas = await findByTestId("canvas-div");
        const editMode = await findByTestId("canvas-editMode-div");

        expect(canvas).toContainElement(editMode);
        expect(editMode).not.toContainElement(canvas);

    })


    
})
