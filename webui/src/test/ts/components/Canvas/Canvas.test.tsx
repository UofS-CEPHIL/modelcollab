import React from 'react';
<<<<<<< HEAD
import { render, fireEvent, act } from "@testing-library/react";

import { FirebaseDataModel } from "database/build/data/FirebaseDataModel";
import { StockFirebaseComponent } from 'database/build/data/FirebaseComponentModel';

import Canvas, { Props } from "../../../../main/ts/components/Canvas/Canvas";
import { UiMode } from '../../../../main/ts/components/Canvas/UiMode';

const TEST_SESSION_ID: string = "0";
const TEST_COMPONENT_ID: string = "1";
const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;


=======
import { render, act, getByTestId } from "@testing-library/react";
import Canvas, { Props } from "../../../../main/ts/components/Canvas/Canvas";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { UiMode } from '../../../../main/ts/components/Canvas/Mode/Mode';
import { FlowFirebaseComponent, StockFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';
import { DataContainer } from '../../../../main/ts/data/DataContainer';

const TEST_SESSION_ID: string = "0";

const TEST_STOCK_COMPONENT_ID: string = "1";
const TEST_STOCK2_COMPONENT_ID: string = "2";

const TEST_FLOW_COMPONENT_ID: string = "99";

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;

>>>>>>> Long-branch
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

<<<<<<< HEAD
    test("Should display Canvas with default setting", async () => {
        const { findByTestId } = renderCanvas();
        const canvas = await findByTestId("canvas-div");

        expect(canvas).toHaveClass("draggable_container");
    });

    test("Should invoke callback when on Create mode", async () => {
        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas(
            { mode: UiMode.CREATE, firebaseDataModel: firebaseDataModel }
        );
        const canvas = await findByTestId("canvas-div");

        fireEvent.click(canvas);
        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(null);
        expect(updateFunction).toHaveBeenCalled();

    });

    test("Should invoke useState when click on the text, when on mode Move", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];

        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ mode: UiMode.MOVE });
        const canvas = await findByTestId("canvas-div");
        fireEvent.click(canvas, { target: { className: "Mui_Stock", id: "5" } });

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith("5");
    });

    test("Should invoke callback when on Delete mode", async () => {
        const removeFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: removeFunction,
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas(
            { mode: UiMode.DELETE, firebaseDataModel: firebaseDataModel }
        );
        const canvas = await findByTestId("canvas-div");

        fireEvent.click(canvas, { target: { className: "Mui_Stock" } });

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(null);
        expect(removeFunction).toBeCalled();
    });

    test("Should subscribe to data model", async () => {
        const stockCreatedFunction = jest.fn();
        const stockRemovedFunction = jest.fn();
=======
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

    test("Should subscribe to data model", async () => {
        const componentCreatedFunction = jest.fn();
        const componentRemovedFunction = jest.fn();
>>>>>>> Long-branch

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
<<<<<<< HEAD
            registerComponentCreatedListener: stockCreatedFunction,
            registerComponentRemovedListener: stockRemovedFunction
        };
        renderCanvas({ firebaseDataModel: firebaseDataModel });
        expect(stockCreatedFunction).toHaveBeenCalledTimes(1);
        expect(stockRemovedFunction).toHaveBeenCalledTimes(1);
    });


    test("Should update Stock list useState when new Stock is added to the database", async () => {
        const stockCreatedFunction = jest.fn();
=======
            registerComponentCreatedListener: componentCreatedFunction,
            registerComponentRemovedListener: componentRemovedFunction
        };
        renderCanvas({ firebaseDataModel: firebaseDataModel });
        expect(componentCreatedFunction).toHaveBeenCalledTimes(1);
        expect(componentRemovedFunction).toHaveBeenCalledTimes(1);
    });


    test("Should update DataContainer in useState when new Stock is added to the database", async () => {
        const componentCreatedFunction = jest.fn();
>>>>>>> Long-branch

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
<<<<<<< HEAD
            registerComponentCreatedListener: stockCreatedFunction,
=======
            registerComponentCreatedListener: componentCreatedFunction,
>>>>>>> Long-branch
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        const canvas = await findByTestId("canvas-div");

        act(() =>
<<<<<<< HEAD
            stockCreatedFunction.mock.lastCall[1](
                new StockFirebaseComponent(
                    TEST_COMPONENT_ID,
=======
            componentCreatedFunction.mock.lastCall[1](
                new StockFirebaseComponent(
                    TEST_STOCK_COMPONENT_ID,
>>>>>>> Long-branch
                    { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" }
                )
            )
        );

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(
<<<<<<< HEAD
            [new StockFirebaseComponent(TEST_COMPONENT_ID, { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" })]
        );
    });

    test("Should update Stock list useState when Stock is deleted on the database", async () => {
        const stockRemovedFunction = jest.fn();
        const stockAddedFunction = jest.fn();
=======
            new DataContainer([],[new StockFirebaseComponent(TEST_STOCK_COMPONENT_ID, { x: TEST_X_VALUE, y: TEST_Y_VALUE, text: "", initvalue: "" })])
        );
    });

    test("Should update DataContainer in useState when new Flow is added to the database", async () => {
        const componentCreatedFunction = jest.fn();
>>>>>>> Long-branch

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: () => { },
            removeComponent: () => { },
<<<<<<< HEAD
            registerComponentCreatedListener: stockAddedFunction,
            registerComponentRemovedListener: stockRemovedFunction
=======
            registerComponentCreatedListener: componentCreatedFunction,
            registerComponentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState, setStateMock];
        jest.spyOn(React, "useState").mockImplementation(useStateMock);

        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });

        const canvas = await findByTestId("canvas-div");

        act(() =>
            componentCreatedFunction.mock.lastCall[1](
                new FlowFirebaseComponent(
                    TEST_FLOW_COMPONENT_ID,
                    { to: TEST_STOCK_COMPONENT_ID, from: TEST_STOCK2_COMPONENT_ID, dependsOn: [""], text: "", equation:"" }
                )
            )
        );

        jest.spyOn(React, "useState").mockRestore();

        expect(setStateMock).toBeCalledWith(
            new DataContainer([],[],[new FlowFirebaseComponent(TEST_FLOW_COMPONENT_ID, { to: TEST_STOCK_COMPONENT_ID, from: TEST_STOCK2_COMPONENT_ID, dependsOn: [""], text: "", equation:"" })])
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
>>>>>>> Long-branch
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: StockFirebaseComponent[]) => [
            useState,
            setStateMock
        ];

        const spy = jest.spyOn(React, "useState").mockImplementation(useStateMock);
        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });
<<<<<<< HEAD
        act(() => stockAddedFunction.mock.lastCall[1](
            new StockFirebaseComponent(
                TEST_COMPONENT_ID,
=======
        act(() => componentAddedFunction.mock.lastCall[1](
            new StockFirebaseComponent(
                TEST_STOCK_COMPONENT_ID,
>>>>>>> Long-branch
                { x: TEST_X_VALUE, y: TEST_Y_VALUE, initvalue: "", text: "" }
            )
        ));
        spy.mockClear();  // Forget about adding the stock since we're testing deletion

        const canvas = await findByTestId("canvas-div");
<<<<<<< HEAD
        act(() => stockRemovedFunction.mock.lastCall[1](TEST_COMPONENT_ID));
        expect(setStateMock).toBeCalledWith([]);
    })
=======
        act(() => componentRemovedFunction.mock.lastCall[1](TEST_STOCK_COMPONENT_ID));
        expect(setStateMock).toBeCalledWith(new DataContainer());
    })

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
        const useStateMock: any = (useState: StockFirebaseComponent[]) => [
            useState,
            setStateMock
        ];

        const spy = jest.spyOn(React, "useState").mockImplementation(useStateMock);
        const { findByTestId } = renderCanvas({ firebaseDataModel: firebaseDataModel });
        act(() => componentAddedFunction.mock.lastCall[1](
            new FlowFirebaseComponent(
                TEST_FLOW_COMPONENT_ID,
                { to: TEST_STOCK_COMPONENT_ID, from: TEST_STOCK2_COMPONENT_ID, dependsOn: [""], text: "", equation:"" }
            )
        ));
        spy.mockClear();  // Forget about adding the stock since we're testing deletion

        const canvas = await findByTestId("canvas-div");
        act(() => componentRemovedFunction.mock.lastCall[1](TEST_FLOW_COMPONENT_ID));
        expect(setStateMock).toBeCalledWith(new DataContainer());
    })
    
>>>>>>> Long-branch
})
