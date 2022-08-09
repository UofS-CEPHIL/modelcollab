// import { ComponentType, FirebaseDataComponent, StockFirebaseComponent } from "database/build/export";
import {FirebaseComponentModel as schema} from "database/build/export";
import { ComponentType } from "database/build/FirebaseComponentModel";
import { browserLocalPersistence } from "firebase/auth";
import FirebaseInteractions from "./data/FirebaseInteractions";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "./doTests";

import {createFirstStock,verifyFirebaseHasOneStock,editFirstStockText_Save, verifyFirstStockTextUpdatedInFirebase, editFirstStockInitValue_NoSave, verifyFirstStockInitValueDidNotUpdateInFirebase, editFirstStockInitValue_Save, verifyFirstStockInitValueUpdatedInFirebase, moveFirstStock, verifyFirstStockLocationUpdatedInFirebase} from "./testSuits/FirstStockTestSuit"
import {createSecondStock,verifyFirebaseHasTwoStock,editSecondStockText_NoSave, verifySecondStockTextDidNotUpdateInFirebase, editSecondStockText_Save, verifySecondStockTextUpdateInFirebase, editSecondStockInitValue_NoSave, verifySecondStockInitValueDidNotUpdateInFirebase, editSecondStockInitValue_Save, verifySecondStockInitValueUpdatedInFirebase, moveSecondStock, verifySecondStockLocationUpdatedInFirebase} from "./testSuits/SecondStockTestSuit"
import {createFirstFlow,verifyFirebaseHasOneFlow,editFirstFlowText_Save, verifyFirstFlowTextUpdatedInFirebase, editFirstFlowEquation_NoSave, verifyFirstFlowEquationDidNotUpdateInFirebase, editFirstFlowEquation_Save, verifyFirstFlowEquationUpdatedInFirebase} from "./testSuits/FirstFlowTestSuit"
import {createThirdStock,verifyFirebaseHasThreeStock,editThirdStockText_Save, verifyThirdStockTextUpdatedInFirebase, editThirdStockInitValue_NoSave, verifyThirdStockInitValueDidNotUpdateInFirebase, editThirdStockInitValue_Save, verifyThirdStockInitValueUpdatedInFirebase, moveThirdStock, verifyThirdStockLocationUpdatedInFirebase} from "./testSuits/ThirdStockTestSuit"
import {createSecondFlow,verifyFirebaseHasTwoFlow,editSecondFlowText_NoSave, verifySecondFlowTextDidNotUpdatInFirebase,editSecondFlowText_Save, verifySecondFlowTextUpdatedInFirebase ,editSecondFlowEquation_NoSave, verifySecondFlowEquationDidNotUpdateInFirebase, editSecondFlowEquation_Save, verifySecondFlowEquationUpdatedInFirebase} from "./testSuits/SecondFlowTestSuit"


export const CANVAS_CLASSNAME = "konvajs-content";
const TOOLBAR_ID = "toolbar-box";

// export const STOCK_CLASSNAME = "stock-div";


export const EDIT_BOX_NAME_CLASSNAME = "MuiOutlinedInput-input MuiInputBase-input Name css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input";
export const EDIT_BOX_INITVAL_CLASSNAME = "MuiOutlinedInput-input MuiInputBase-input Init_Value css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input";
export const EDIT_BOX_EQUATION_CLASSNAME = "MuiOutlinedInput-input MuiInputBase-input Equation css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input";


const EXPECTED_TITLE = "ModelCollab";

// async function getCanvasCords(driver: any, xOffset: number, yOffset: number): Promise<{x: number, y:number}> {
//     const canvas = await driver.findElement(selenium.By.tagName("canvas"));

//     const width = await canvas.getAttribute("width");
//     const height = await canvas.getAttribute("height");

//     const xOrigin = - width/2;
//     const yOrigin = - height/2;

//     console.log(xOrigin,yOrigin);
        
//     return {x: Math.ceil(xOffset + xOrigin), y: Math.ceil(yOffset + yOrigin)};
// }

async function getSelectedToolbarTabId(driver: any): Promise<string | null> {
    try {
        const selectedTab = await driver.findElement(selenium.By.className("Mui-selected"));
        return selectedTab.getAttribute("id");
    }
    catch (e) {
        return null;
    }
}


async function verifyCanvasIsInMode(driver: any, mode: string): Promise<string> {
    const selectedId = await getSelectedToolbarTabId(driver);
    if (selectedId === "")
        return "Selected toolbar tab had blank ID.";
    if (!selectedId)
        return "Unable to find selected toolbar tab.";
    else if (selectedId !== mode + "-tab")
        return `Expected Canvas to be in ${mode} mode but found: ${selectedId}.`;
    else
        return SUCCESS_MESSAGE;
}

async function verifyPageHasCorrectTitle(driver: any): Promise<string> {
    return await ensurePageHasTitle(driver, EXPECTED_TITLE);
}

async function verifyPageHasToolbar(driver: any): Promise<string> {
    return await searchForElementWithId(driver, TOOLBAR_ID);
}

async function verifyToolbarIsFormattedCorrectly(driver: any): Promise<string> {
    async function findAndValidateButton(name: string): Promise<string> {
        let button;
        try {
            button = await driver.findElement(selenium.By.id(name + "-tab"));
        }
        catch (e: any) {
            if (e.name === "NoSuchElementError")
                return `Unable to find button: ${name}`;
            else
                throw e;
        }
        const buttonText: string = await button.getText();
        if (buttonText.toLowerCase() !== name.toLowerCase())
            return `Expected button to have text ${name} but found ${buttonText}`;
        else if (!button.isEnabled())
            return `Expected button ${name} to be enabled but was not.`;
        else
            return SUCCESS_MESSAGE;
    }
    let message: string;
    let buttons = ["Move", "Parameter","Stock", "Flow", "Connect", "Edit", "Delete", "Get Code", "Compute Model"];

    for (const button of buttons) {
        message = await findAndValidateButton(button);
        if (message !== SUCCESS_MESSAGE) return message;
    }
    return SUCCESS_MESSAGE;
}

async function verifyPageHasCanvas(driver: any): Promise<string> {
    return await searchForElementWithClassName(driver, CANVAS_CLASSNAME);
}

// async function verifyCanvasIsEmpty(driver: any): Promise<string> {
//     driver.manage().setTimeouts( { implicit: 500 } );
//     return await verifyElementDoesNotExist(
//         driver,
//         selenium.By.className(STOCK_CLASSNAME),
//         "Stock"
//     );
// }

async function clickStockModeButton(driver: any): Promise<string> {
    const stockModeButton = await driver.findElement(selenium.By.id("Stock-tab"));
    if (!stockModeButton) return "Unable to find Stock mode button.";
    await stockModeButton.click();
    return SUCCESS_MESSAGE;
}


async function verifyCanvasIsInStockMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Stock");
}

async function clickEditModeButton(driver: any): Promise<string> {
    const editModeButton = await driver.findElement(selenium.By.id("Edit-tab"));
    if (!editModeButton) return "Unable to find Edit mode button.";
    await editModeButton.click();
    return SUCCESS_MESSAGE;
}

async function verifyCanvasIsInEditMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Edit");
}


async function clickMoveModeButton(driver: any): Promise<string> {
    const moveModeButton = await driver.findElement(selenium.By.id("Move-tab"));
    if (!moveModeButton) return "Unable to find Move mode button.";
    await moveModeButton.click();
    return SUCCESS_MESSAGE;
}

async function verifyCanvasIsInMoveMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Move");
}

async function clickFlowModeButton(driver: any): Promise<string> {
    const moveModeButton = await driver.findElement(selenium.By.id("Flow-tab"));
    if (!moveModeButton) return "Unable to find Flow mode button.";
    await moveModeButton.click();
    return SUCCESS_MESSAGE;
}

async function verifyCanvasIsInFlowMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Flow");
}

async function middleCanvasClick(driver: any): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(CANVAS_CLASSNAME));
    const message = await clickElementWithOffset(driver,canvas, 0,0);
    return message
}

async function notMiddleCanvasClick(driver: any): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(CANVAS_CLASSNAME));
    const message = await clickElementWithOffset(driver,canvas, -200,-300);
    return message
}

/*
  This test expects to start logged in on the canvas page, with no stocks.
  This test will leave the Canvas in that same state.
 */

export const canvasPageTestSuite:
    ((driver: any, firebaseDm?: FirebaseInteractions) => Promise<string>)[] =
    [
        verifyPageHasCorrectTitle,
        verifyPageHasToolbar,
        verifyToolbarIsFormattedCorrectly,
        verifyPageHasCanvas,

        verifyCanvasIsInMoveMode,

        clickStockModeButton,
        verifyCanvasIsInStockMode,

        createFirstStock,
        verifyFirebaseHasOneStock,
        clickEditModeButton,
        verifyCanvasIsInEditMode,
        editFirstStockText_Save,
        verifyFirstStockTextUpdatedInFirebase,
        editFirstStockInitValue_NoSave,
        verifyFirstStockInitValueDidNotUpdateInFirebase,
        editFirstStockInitValue_Save,
        verifyFirstStockInitValueUpdatedInFirebase,
        clickMoveModeButton,
        verifyCanvasIsInMoveMode,
        moveFirstStock,
        verifyFirstStockLocationUpdatedInFirebase,

        clickStockModeButton,
        verifyCanvasIsInStockMode,

        createSecondStock,
        verifyFirebaseHasTwoStock,
        clickEditModeButton,
        verifyCanvasIsInEditMode,
        editSecondStockText_NoSave,
        verifySecondStockTextDidNotUpdateInFirebase,
        editSecondStockText_Save,
        verifySecondStockTextUpdateInFirebase,
        editSecondStockInitValue_NoSave,
        verifySecondStockInitValueDidNotUpdateInFirebase,
        editSecondStockInitValue_Save,
        verifySecondStockInitValueUpdatedInFirebase,
        clickMoveModeButton,
        verifyCanvasIsInMoveMode,
        moveSecondStock,
        verifySecondStockLocationUpdatedInFirebase,

        clickFlowModeButton,
        verifyCanvasIsInFlowMode,
        
        createFirstFlow,
        verifyFirebaseHasOneFlow,
        middleCanvasClick,
        clickEditModeButton,
        verifyCanvasIsInEditMode,
        editFirstFlowText_Save, 
        verifyFirstFlowTextUpdatedInFirebase, 
        editFirstFlowEquation_NoSave, 
        verifyFirstFlowEquationDidNotUpdateInFirebase, 
        editFirstFlowEquation_Save, 
        verifyFirstFlowEquationUpdatedInFirebase,

        clickStockModeButton,
        verifyCanvasIsInStockMode,


        createThirdStock,
        verifyFirebaseHasThreeStock,
        clickEditModeButton,
        verifyCanvasIsInEditMode,
        editThirdStockText_Save,
        verifyThirdStockTextUpdatedInFirebase,
        editThirdStockInitValue_NoSave,
        verifyThirdStockInitValueDidNotUpdateInFirebase,
        editThirdStockInitValue_Save,
        verifyThirdStockInitValueUpdatedInFirebase,
        clickMoveModeButton,
        verifyCanvasIsInMoveMode,
        moveThirdStock,
        verifyThirdStockLocationUpdatedInFirebase,


        clickFlowModeButton,
        verifyCanvasIsInFlowMode,
        
        createSecondFlow,
        verifyFirebaseHasTwoFlow,
        middleCanvasClick,
        clickEditModeButton,
        verifyCanvasIsInEditMode,
        editSecondFlowText_Save, 
        verifySecondFlowTextUpdatedInFirebase, 
        editSecondFlowEquation_NoSave, 
        verifySecondFlowEquationDidNotUpdateInFirebase, 
        editSecondFlowEquation_Save, 
        verifySecondFlowEquationUpdatedInFirebase,

];
