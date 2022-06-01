import React from 'react';
import { render, fireEvent, createEvent, act } from "@testing-library/react";

import Canvas, {Props} from "../../../../main/ts/components/Canvas/Canvas";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';

const SESSION_ID: string = "0";
const MOVE: string =  "Move";
const CREATE: string = "Create";
const DELETE: string = "Delete";

function renderCanvas(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        user: null,
        sessionId: SESSION_ID,
        mode: MOVE,
        firebaseDataModel: {updateComponent: () => { }, subscribeToComponent: () => { },             removeComponent: () => { },
        componentCreatedListener: () => { },
        componentRemovedListener: () => { } }
    };
    return render(<Canvas {...defaultProps} {...props} />);
}

describe("<Canvas />", () => {

    test("should display Canvas with default setting", async () => {
        const {findByTestId}  = renderCanvas();
        const canvas = await findByTestId("canvas-div");

        expect(canvas).toHaveClass("draggable_container")

    });

    test("Should invoke callback when on Create mode", async () => {
        const updateFunction = jest.fn();
        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            componentCreatedListener: () => { },
            componentRemovedListener: () => { }
        };

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState,setStateMock]
        jest.spyOn(React, "useState").mockImplementation(useStateMock)

        const { findByTestId } = renderCanvas({mode: "Create", firebaseDataModel: firebaseDataModel});
        const canvas = await findByTestId("canvas-div")

        fireEvent.click(canvas)
        jest.spyOn(React,"useState").mockRestore()

        expect(setStateMock).toBeCalledWith(null)
        expect(updateFunction).toHaveBeenCalled();

    });

    test("Should invoke useState when click on the text, when on mode Move", async () => {

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState,setStateMock]

        jest.spyOn(React, "useState").mockImplementation(useStateMock)

        const {findByTestId} = renderCanvas({mode: "Move"});
        const canvas = await findByTestId("canvas-div")
        fireEvent.click(canvas, {target: {className: "Mui_Stock", id: "5"}})

        jest.spyOn(React,"useState").mockRestore()

        expect(setStateMock).toBeCalledWith("5")
    })

    test("Should invoke callback when on Delete mode", async () => {
        const removeFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => {},
            updateComponent: () => {},
            removeComponent: removeFunction,
            componentCreatedListener: () => {},
            componentRemovedListener: () => {}
        }

        const setStateMock = jest.fn();
        const useStateMock: any = (useState: any) => [useState,setStateMock]
        jest.spyOn(React, "useState").mockImplementation(useStateMock)

        const {findByTestId} = renderCanvas({mode: "Delete", firebaseDataModel: firebaseDataModel})
        const canvas = await findByTestId("canvas-div")

        fireEvent.click(canvas, {target: {className: "Mui_Stock"}}) 

        jest.spyOn(React,"useState").mockRestore()

        expect(setStateMock).toBeCalledWith(null)
        expect(removeFunction).toBeCalled()
    })
})
