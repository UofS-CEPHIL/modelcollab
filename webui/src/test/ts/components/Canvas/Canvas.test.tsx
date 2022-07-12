import React from 'react';
import { render, act } from "@testing-library/react";

import Canvas, { Props } from "../../../../main/ts/components/Canvas/Canvas";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { UiMode } from '../../../../main/ts/components/Canvas/Mode/UiMode';
import { FirebaseComponentModel as schema } from "database/build/export";
import { DataContainer } from '../../../../main/ts/data/DataContainer';

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
        const { findByTestId } = renderCanvas();
        const canvas = await findByTestId("canvas-div");
        const moveMode = await findByTestId("canvas-moveMode-div");

        expect(canvas).toContainElement(moveMode);
        expect(moveMode).not.toContainElement(canvas);

    });

    test("Should display Canvas with Create Mode", async () => {
        const { findByTestId } = renderCanvas({ mode: UiMode.CREATE });
        const canvas = await findByTestId("canvas-div");
        const createMode = await findByTestId("canvas-createMode-div");

        expect(canvas).toContainElement(createMode);
        expect(createMode).not.toContainElement(canvas);

    })

    test("Should display Canvas with Delete Mode", async () => {
        const { findByTestId } = renderCanvas({ mode: UiMode.DELETE });
        const canvas = await findByTestId("canvas-div");
        const deleteMode = await findByTestId("canvas-deleteMode-div");

        expect(canvas).toContainElement(deleteMode);
        expect(deleteMode).not.toContainElement(canvas);

    })

    test("Should display Canvas with Flow Mode", async () => {
        const { findByTestId } = renderCanvas({ mode: UiMode.FLOW });
        const canvas = await findByTestId("canvas-div");
        const flowMode = await findByTestId("canvas-flowMode-div");

        expect(canvas).toContainElement(flowMode);
        expect(flowMode).not.toContainElement(canvas);

    })

    test("Should display Canvas with Edit Mode", async () => {
        const { findByTestId } = renderCanvas({ mode: UiMode.EDIT });
        const canvas = await findByTestId("canvas-div");
        const editMode = await findByTestId("canvas-editMode-div");

        expect(canvas).toContainElement(editMode);
        expect(editMode).not.toContainElement(canvas);

    })

    test("Should subscribe to data model", async () => {
        const componentCreatedFunction = jest.fn();
        const componentRemovedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentCreatedFunction,
            registerComponentRemovedListener: componentRemovedFunction
        };
        renderCanvas({ firebaseDataModel: firebaseDataModel });
        expect(componentCreatedFunction).toHaveBeenCalledTimes(1);
        expect(componentRemovedFunction).toHaveBeenCalledTimes(1);
    });


    test("Should update DataContainer in useState when new Stock is added to the database", async () => {
        const componentCreatedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentCreatedFunction,
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        await findByTestId("canvas-div");

        act(() =>
            componentCreatedFunction.mock.lastCall[1](
                new schema.StockFirebaseComponent(
                    TEST_STOCK_COMPONENT_ID,
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                )
            )
        );

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(
            new DataContainer(
                [],
                [
                    new schema.StockFirebaseComponent(
                        TEST_STOCK_COMPONENT_ID,
                        {
                            x: TEST_X_VALUE,
                            y: TEST_Y_VALUE,
                            text: "",
                            initvalue: ""
                        }
                    )
                ]
            )
        );
    });

    test("Should update DataContainer in useState when new Flow is added to the database", async () => {
        const componentCreatedFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentCreatedFunction,
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        await findByTestId("canvas-div");

        act(() =>
            componentCreatedFunction.mock.lastCall[1](
                new schema.FlowFirebaseComponent(
                    TEST_FLOW_COMPONENT_ID,
                    { to: TEST_STOCK_COMPONENT_ID, from: TEST_STOCK2_COMPONENT_ID, dependsOn: [""], text: "", equation: "" }
                )
            )
        );

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(
            new DataContainer(
                [],
                [],
                [
                    new schema.FlowFirebaseComponent(
                        TEST_FLOW_COMPONENT_ID,
                        {
                            to: TEST_STOCK_COMPONENT_ID,
                            from: TEST_STOCK2_COMPONENT_ID,
                            dependsOn: [""],
                            text: "",
                            equation: ""
                        }
                    )
                ]
            )
        );
    });

    test("Should update Data Container useState when Stock is deleted on the database", async () => {
        const componentRemovedFunction = jest.fn();
        const componentAddedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentAddedFunction,
            registerComponentRemovedListener: componentRemovedFunction
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: schema.StockFirebaseComponent[]) => [
            useState,
            setStateMock
        ];

        const spy = jest.spyOn(React, "useState").mockImplementation(useStateMock);
        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });
        act(() => componentAddedFunction.mock.lastCall[1](
            new schema.StockFirebaseComponent(
                TEST_STOCK_COMPONENT_ID,
                { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
            )
        ));
        spy.mockClear();  // Forget about adding the stock since we're testing deletion

        const canvas = await findByTestId("canvas-div");
        act(() => componentRemovedFunction.mock.lastCall[1](TEST_STOCK_COMPONENT_ID));
        expect(setStateMock).toBeCalledWith(new DataContainer());
    });

    test("Should update Data Container useState when Flow is deleted on the database", async () => {
        const componentRemovedFunction = jest.fn();
        const componentAddedFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: componentAddedFunction,
            registerComponentRemovedListener: componentRemovedFunction
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: schema.StockFirebaseComponent[]) => [
            useState,
            setStateMock
        ];

        const spy = jest.spyOn(React, "useState").mockImplementation(useStateMock);
        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });
        act(() => componentAddedFunction.mock.lastCall[1](
            new schema.FlowFirebaseComponent(
                TEST_FLOW_COMPONENT_ID,
                { to: TEST_STOCK_COMPONENT_ID, from: TEST_STOCK2_COMPONENT_ID, dependsOn: [""], text: "", equation: "" }
            )
        ));
        spy.mockClear();  // Forget about adding the stock since we're testing deletion

        await findByTestId("canvas-div");
        act(() => componentRemovedFunction.mock.lastCall[1](TEST_FLOW_COMPONENT_ID));
        expect(setStateMock).toBeCalledWith(new DataContainer());
    });
});
