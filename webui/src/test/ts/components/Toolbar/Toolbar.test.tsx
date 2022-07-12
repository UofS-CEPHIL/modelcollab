import { render, fireEvent } from "@testing-library/react";

<<<<<<< HEAD
import { UiMode } from "../../../../main/ts/components/Canvas/UiMode";
=======
import { UiMode } from "../../../../main/ts/components/Canvas/Mode/Mode";
>>>>>>> Long-branch
import Toolbar, { Props } from "../../../../main/ts/components/Toolbar/Toolbar";

function renderToolbar(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        mode: UiMode.MOVE,
        setMode: () => { }
    }
    return render(<Toolbar {...defaultProps} {...props} />);
}

describe("<Toolbar />", () => {
    test("Should display a Toolbar with default settings", async () => {
        const { findByTestId } = renderToolbar();

        const toolbarbox = await findByTestId("toolbar-box");
        const toolbartabs = await findByTestId("toolbar-tabs");
        expect(toolbarbox).toContainElement(toolbartabs);
        expect(toolbartabs).not.toContainElement(toolbarbox);
    });

    test("Should set to MOVE, when Move mode is selected", async () => {
        const setMode = jest.fn();
        const { findByTestId, getByRole } = renderToolbar({ setMode: setMode });

        const toolbartabs = await findByTestId("toolbar-tabs");

        const tab = getByRole('tab', { name: 'Move' });

        fireEvent.click(tab);
        expect(getByRole('tab', { selected: true })).toHaveTextContent('Move');

        fireEvent.click(tab, { target: { textContent: "Move" } });
        expect(setMode).toBeCalledWith(UiMode.MOVE);
    })

    test("Should set to CREATE, when Create mode is selected", async () => {
        const setMode = jest.fn();
        const { findByTestId, getByRole } = renderToolbar({ setMode: setMode });

        const toolbartabs = await findByTestId("toolbar-tabs")

        const tab = getByRole('tab', { name: 'Create' });

        fireEvent.click(tab, { target: { textContent: "Create" } })
        expect(setMode).toBeCalledWith(UiMode.CREATE);
    })

    test("Should set to DELETE, when Delete mode is selected", async () => {
        const setMode = jest.fn();
        const { findByTestId, getByRole } = renderToolbar({ setMode: setMode })

        const toolbartabs = await findByTestId("toolbar-tabs")

        const tab = getByRole('tab', { name: 'Delete' });

        fireEvent.click(tab, { target: { textContent: "Delete" } })
        expect(setMode).toBeCalledWith(UiMode.DELETE)
    })

    test("Should set Flow, when Flow mode is selected", async () => {
        const setMode = jest.fn();
        const { findByTestId, getByRole } = renderToolbar({ setMode: setMode })

        const toolbartabs = await findByTestId("toolbar-tabs")

        const tab = getByRole('tab', { name: 'Flow' });

        fireEvent.click(tab, { target: { textContent: "Flow" } })
        expect(setMode).toBeCalledWith(UiMode.FLOW)
    })

    test("Should set Edit, when Edit mode is selected", async () => {
        const setMode = jest.fn();
        const { findByTestId, getByRole } = renderToolbar({ setMode: setMode })

        const toolbartabs = await findByTestId("toolbar-tabs")

        const tab = getByRole('tab', { name: 'Edit' });

        fireEvent.click(tab, { target: { textContent: "Edit" } })
        expect(setMode).toBeCalledWith(UiMode.EDIT)
    })
 
})
