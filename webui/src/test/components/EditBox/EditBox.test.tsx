import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReactElement } from "react";
import { FirebaseComponentModel as schema } from "database/build/export";
import EditBox, { Props } from "../../../main/ts/components/EditBox/EditBox";

const AN_ID = "0";

function makeEditBox(props: Partial<Props>): ReactElement {
    const A_COMPONENT = new schema.SumVariableFirebaseComponent(AN_ID, { x: 0, y: 0, text: "a" });
    const DEFAULT: Props = {
        initialComponent: A_COMPONENT,
        handleSave: _ => { },
        handleCancel: () => { }
    };
    return (
        <EditBox {...DEFAULT} {...props} />
    );
}

function getTextBoxByName(name: string): HTMLElement | undefined {
    const textField = screen.getAllByRole("textbox").find(e => e.getAttribute("name") === name);
    return textField;
}

describe("<EditBox /> with Stock", () => {

    const INITIAL_TEXT = "a";
    const INITIAL_VALUE = "0";
    const initialComponent = new schema.StockFirebaseComponent(AN_ID, { x: 0, y: 0, text: INITIAL_TEXT, initvalue: INITIAL_VALUE });

    beforeEach(() => {
        const editBox = makeEditBox({ initialComponent });
        render(editBox);
    });

    test("Should have correct header text", async () => {
        const headerTextElement = screen.getByTestId("HeaderText");
        expect(headerTextElement).toBeDefined();
        expect(headerTextElement.textContent).toStrictEqual("Edit Stock");
    });

    test("Should have a field for name", async () => {
        const textBox = getTextBoxByName("text");
        expect(textBox).toBeDefined();
    });

    test("'text' field should have correct starting value", async () => {
        const textBox = getTextBoxByName("text");
        expect(textBox).toBeDefined();
        const textValue = textBox?.getAttribute("value");
        expect(textValue).toBeDefined();
        expect(textValue).toStrictEqual(INITIAL_TEXT);
    });

    test("Should have a field called initvalue", async () => {
        const textBox = getTextBoxByName("initvalue");
        expect(textBox).toBeDefined();
    });

    test("'initvalue' field should have correct starting value", async () => {
        const textBox = getTextBoxByName("initvalue");
        expect(textBox).toBeDefined();
        const textValue = textBox?.getAttribute("value");
        expect(textValue).toBeDefined();
        expect(textValue).toStrictEqual(INITIAL_VALUE);
    });

    test("'text' field should be editable", async () => {
        const NEW_TEXT = "newtext";
        let textBox = getTextBoxByName("text");
        expect(textBox).toBeDefined();
        if (textBox === undefined) throw new Error("unreachable");

        fireEvent.change(textBox, { target: { value: NEW_TEXT } });
        waitFor(() => getTextBoxByName("text")?.getAttribute("value") === NEW_TEXT);
    });

    test("'initvalue' field should be editable", async () => {
        const NEW_TEXT = "newtext";
        let textBox = getTextBoxByName("initvalue");
        expect(textBox).toBeDefined();
        if (textBox === undefined) throw new Error("unreachable");

        fireEvent.change(textBox, { target: { value: NEW_TEXT } })
        waitFor(() => getTextBoxByName("initvalue")?.getAttribute("value") === NEW_TEXT);
    });

    test("Submit button should call the submit function with up-to-date data", async () => {
        const handleSave = jest.fn();
        const editBox = makeEditBox({ handleSave, initialComponent });
        render(editBox);
        const NEW_NAME = "newname";
        const NEW_INIT = "newinit";
        let textBox = getTextBoxByName("text");
        expect(textBox).toBeDefined();
        if (textBox === undefined) throw new Error("unreachable");
        fireEvent.change(textBox, { target: { value: NEW_NAME } });
        waitFor(() => getTextBoxByName("text")?.getAttribute("value") === NEW_NAME);

        textBox = getTextBoxByName("initvalue");
        expect(textBox).toBeDefined();
        if (textBox === undefined) throw new Error("unreachable");
        fireEvent.change(textBox, { target: { value: NEW_INIT } });
        waitFor(() => getTextBoxByName("initvalue")?.getAttribute("value") === NEW_INIT);

        const submitButtons = screen.getAllByText("Save");
        expect(submitButtons).toBeDefined();
        expect(submitButtons.length).toBeGreaterThan(0);
        if (submitButtons === undefined) throw new Error("unreachable");
        submitButtons.forEach(b => fireEvent.click(b));
        expect(handleSave).toHaveBeenCalled();
        expect(handleSave.mock.calls[0][0]).toEqual(
            new schema.StockFirebaseComponent(initialComponent.getId(), { x: 0, y: 0, text: NEW_NAME, initvalue: NEW_INIT })
        );
    });

    test("Cancel button should call the cancel function", async () => {
        const handleCancel = jest.fn();
        const editBox = makeEditBox({ initialComponent, handleCancel });
        render(editBox);
        const buttons = screen.getAllByText("Cancel");
        expect(buttons).toBeDefined();
        expect(buttons.length).toBeGreaterThan(0);
        if (buttons === undefined) throw new Error("unreachable");

        buttons.forEach(b => fireEvent.click(b));
        expect(handleCancel).toHaveBeenCalled();
    });
});
