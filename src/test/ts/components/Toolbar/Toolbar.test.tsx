import React from 'react';

import { render, fireEvent, createEvent, act } from "@testing-library/react";

import Toolbar, {Props} from "../../../../main/ts/components/Toolbar/Toolbar"

function renderToolbar( props: Partial<Props> = {}){
    const defaultProps: Props = {
        mode: "Move",
        setMode: () => {}
    }
    return render(<Toolbar {...defaultProps} {... props}/>)
}

describe("<Toolbar />", () => {
    test("Should display a stock with default settings", async () => {
        const { findByTestId } = renderToolbar();

        const toolbarbox = await findByTestId("toolbar-box");

        const toolbartabs = await findByTestId("toolbar-tabs")

        expect(toolbarbox).toContainElement(toolbartabs)
        expect(toolbartabs).not.toContainElement(toolbarbox)


    });    
    
    test("Should set to MOVE, when Move mode is selected", async () =>{
        const setMode = jest.fn();
        const {findByTestId, getByRole} = renderToolbar({setMode: setMode})

        const toolbartabs = await findByTestId("toolbar-tabs")

        const tab = getByRole('tab', { name: 'Move' });
        
        fireEvent.click(tab);
        expect(getByRole('tab', { selected: true})).toHaveTextContent('Move')

        fireEvent.click(tab, {target: {textContent: "Move"}})
        expect(setMode).toBeCalledWith("Move")
    })

    test("Should set to CREATE, when Create mode is selected", async () =>{
        const setMode = jest.fn();
        const {findByTestId, getByRole} = renderToolbar({setMode: setMode})

        const toolbartabs = await findByTestId("toolbar-tabs")

        const tab = getByRole('tab', { name: 'Create' });
        
        fireEvent.click(tab);
        expect(getByRole('tab', { selected: true})).toHaveTextContent('Create')

        fireEvent.click(tab, {target: {textContent: "Create"}})
        expect(setMode).toBeCalledWith("Create")
    })

    test("Should set to DELETE, when Delete mode is selected", async () =>{
        const setMode = jest.fn();
        const {findByTestId, getByRole} = renderToolbar({setMode: setMode})

        const toolbartabs = await findByTestId("toolbar-tabs")

        const tab = getByRole('tab', { name: 'Delete' });
        
        fireEvent.click(tab);
        expect(getByRole('tab', { selected: true})).toHaveTextContent('Delete')

        fireEvent.click(tab, {target: {textContent: "Delete"}})
        expect(setMode).toBeCalledWith("Delete")
    })
})