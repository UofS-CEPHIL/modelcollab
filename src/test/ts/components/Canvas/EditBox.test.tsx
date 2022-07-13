import React from 'react';
import { render, fireEvent, act } from "@testing-library/react";

import EditBox, { Props }from "../../../../main/ts/components/Canvas/EditBox";
import FirebaseDataModel from '../../../../main/ts/data/FirebaseDataModel';
import { StockFirebaseComponent } from '../../../../main/ts/data/FirebaseComponentModel';

const TEST_X_VALUE: number = 100;
const TEST_Y_VALUE: number = 200;
const TEST_TEXT: string = "Hello World"
const TEST_SESSION_ID: string = "0";
const TEST_COMPONENT_ID: string = "0";


function renderStock(props: Partial<Props> = {}) {
    const defaultProps: Props = {

        sessionId: TEST_SESSION_ID,
        open: true,
        setOpen: () => {},
        component: new StockFirebaseComponent(
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
    test("Should display a stock with default settings", async () => {
        const { findByTestId } = renderStock();

        const editBox_Modal = await findByTestId("editBox-Modal");
        const editBox_Box = await findByTestId("editBox-Box");

        expect(editBox_Modal).toContainElement(editBox_Box);
        expect(editBox_Box).not.toContainElement(editBox_Modal);

        
    });
});