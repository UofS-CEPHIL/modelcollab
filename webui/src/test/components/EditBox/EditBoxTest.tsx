import { ReactElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FirebaseComponentModel as schema } from "database/build/export";
import EditBox, { Props as EditBoxProps } from "../../../main/ts/components/EditBox/EditBox";


export default class EditBoxTest<Component extends schema.FirebaseDataComponent<any>> {

    private static AN_ID = "123";

    private initialComponent: Component;
    private expectedFieldNames: string[];
    private componentTypeName: string;

    public constructor(initialComponent: Component, expectedFieldNames: string[], componentTypeName?: string) {
        this.initialComponent = initialComponent;
        this.expectedFieldNames = expectedFieldNames;
        if (!componentTypeName) {
            const componentType = this.initialComponent.getType().toLowerCase();
            const componentWithFirstCapitalized = componentType.charAt(0).toUpperCase().concat(componentType.slice(1));;
            this.componentTypeName = componentWithFirstCapitalized;
        }
        else {
            this.componentTypeName = componentTypeName;
        }
    }


    public describeTest(): void {
        describe(`<EditBox /> with ${this.componentTypeName}`, () => {

            beforeEach(() => {
                const editBox = this.makeEditBox({ initialComponent: this.initialComponent });
                render(editBox);
            });

            test("Should have correct header text", async () => {
                this.testHeaderText(`Edit ${this.componentTypeName}`);
            });

            this.expectedFieldNames.forEach(fieldName => {
                test(`Should have a field for ${fieldName}`, async () => {
                    const textBox = this.getTextBoxByName(fieldName);
                    expect(textBox).toBeDefined();
                });

                test(`${fieldName} field should have correct starting value`, async () => {
                    const textBox = this.getTextBoxByName(fieldName);
                    expect(textBox).toBeDefined();
                    const textValue = textBox?.getAttribute("value");
                    expect(textValue).toBeDefined();
                    expect(textValue).toStrictEqual(this.initialComponent.getData()[fieldName]);
                });

                test(`${fieldName} field should be editable`, async () => {
                    const NEW_TEXT = "newtext";
                    let textBox = this.getTextBoxByName(fieldName);
                    expect(textBox).toBeDefined();
                    if (textBox === undefined) throw new Error("unreachable");

                    fireEvent.change(textBox, { target: { value: NEW_TEXT } });
                    waitFor(() => this.getTextBoxByName(fieldName)?.getAttribute("value") === NEW_TEXT);
                });
            });


            test("Submit button should call the submit function with up-to-date data", async () => {
                const NEW_VALUE = "value";
                const textFieldToEdit = this.expectedFieldNames[0];
                const handleSave = jest.fn();
                const editBox = this.makeEditBox({ handleSave, initialComponent: this.initialComponent });
                render(editBox);

                let textBox = this.getTextBoxByName(textFieldToEdit);
                expect(textBox).toBeDefined();
                if (textBox === undefined) throw new Error("unreachable");
                fireEvent.change(textBox, { target: { value: NEW_VALUE } });
                waitFor(() => this.getTextBoxByName(textFieldToEdit)?.getAttribute("value") === NEW_VALUE);

                const submitButtons = screen.getAllByText("Save");
                expect(submitButtons).toBeDefined();
                expect(submitButtons.length).toBeGreaterThan(0);
                if (submitButtons === undefined) throw new Error("unreachable");
                submitButtons.forEach(b => fireEvent.click(b));
                expect(handleSave).toHaveBeenCalled();
                expect(typeof handleSave.mock.calls[0][0]).toEqual(typeof this.initialComponent);
                expect((handleSave.mock.calls[0][0] as Component).getData()[textFieldToEdit]).toEqual(NEW_VALUE);
            });

            test("Cancel button should call the cancel function", async () => {
                const handleCancel = jest.fn();
                const editBox = this.makeEditBox({ initialComponent: this.initialComponent, handleCancel });
                render(editBox);
                const buttons = screen.getAllByText("Cancel");
                expect(buttons).toBeDefined();
                expect(buttons.length).toBeGreaterThan(0);
                if (buttons === undefined) throw new Error("unreachable");

                buttons.forEach(b => fireEvent.click(b));
                expect(handleCancel).toHaveBeenCalled();
            });
        });
    }

    private makeEditBox(props: Partial<EditBoxProps>): ReactElement {
        const A_COMPONENT = new schema.SumVariableFirebaseComponent(EditBoxTest.AN_ID, { x: 0, y: 0, text: "a" });
        const DEFAULT: EditBoxProps = {
            initialComponent: A_COMPONENT,
            handleSave: _ => { },
            handleCancel: () => { }
        };
        return (
            <EditBox {...DEFAULT} {...props} />
        );
    }

    private getTextBoxByName(name: string): HTMLElement | undefined {
        const textField = screen.getAllByRole("textbox").find(e => e.getAttribute("name") === name);
        return textField;
    }

    private testHeaderText(expected: string): void {
        const headerTextElement = screen.getByTestId("HeaderText");
        expect(headerTextElement).toBeDefined();
        expect(headerTextElement.textContent).toStrictEqual(expected);
    }
}

