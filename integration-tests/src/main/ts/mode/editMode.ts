import FirebaseInteractions from "../data/FirebaseInteractions";
import {FirebaseComponentModel as schema} from "database/build/export";
import { ComponentType } from "database/build/FirebaseComponentModel";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "../doTests";
import * as canvasConstants from "../canvasPage"

const SAVE_BUTTON_CLASSNAME = "MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButtonBase-root Save css-sghohy-MuiButtonBase-root-MuiButton-root";
const CANCEL_BUTTON_CLASSNAME = "MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButtonBase-root Cancel css-sghohy-MuiButtonBase-root-MuiButton-root";


export async function editStock(driver: any, value: string, className: any, shouldSave: boolean, xOffset:number , yOffset:number): Promise<string> {

    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    const message = await clickElementWithOffset(driver,canvas, xOffset,yOffset);

    if ( message != SUCCESS_MESSAGE){
        return message
    }

    let mui_textfield = await driver.findElement(selenium.By.className(className))
    mui_textfield.sendKeys(value.toString());
    
    mui_textfield = await driver.findElement(selenium.By.className(className))    
    const textField = await mui_textfield.getAttribute("value");

    if (textField !== value.toString())
        return `Expected Stock to have "${value.toString()}" but found "${textField}"`;
        
    let button;
    if (shouldSave){
        button = await driver.findElement(selenium.By.className(SAVE_BUTTON_CLASSNAME));    
    }
    else{
        button = await driver.findElement(selenium.By.className(CANCEL_BUTTON_CLASSNAME));
    }

    try {
        await driver.actions().click(button).perform();
    }
    catch (e) {
        return `Error clicking element: ${e}`;
    }

    return SUCCESS_MESSAGE;
}

export async function verifyStockUpdatedInFirebase(_: any, expectedFirebaseSize: number, expectedValue: string, componentName: string, shouldCheckText: boolean, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== expectedFirebaseSize)
        return `Expected ${expectedFirebaseSize} components but found ${myComponents.length}`;
    
    let myComponentCount = 0;

    for (var i = 0; i < expectedFirebaseSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.STOCK){
            myComponentCount++;

            const name = myComponents[i].getData().text;

            let value;

            if (shouldCheckText){
                value = myComponents[i].getData().text;
            }
            else{
                value = myComponents[i].getData().initvalue;
            }

            if (componentName === name && value !== expectedValue){
                return `Expected Firebase Stock to be "${expectedValue}" but found: "${value}"`; 
            }

            else{
                return SUCCESS_MESSAGE;
            }
        }        
    }
    
    return "Cannot find the Stock in Firebase"

}

export async function editFlow(driver: any, value: string, className: any, shouldSave: boolean, xOffset:number , yOffset:number): Promise<string> {

    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    const message = await clickElementWithOffset(driver,canvas, xOffset,yOffset);

    if ( message != SUCCESS_MESSAGE){
        return message
    }

    let mui_textfield = await driver.findElement(selenium.By.className(className))
    mui_textfield.sendKeys(value.toString());
    
    mui_textfield = await driver.findElement(selenium.By.className(className))    
    const textField = await mui_textfield.getAttribute("value");

    if (textField !== value.toString())
        return `Expected Flow to have "${value.toString()}" but found "${textField}"`;
        
    let button;
    if (shouldSave){
        button = await driver.findElement(selenium.By.className(SAVE_BUTTON_CLASSNAME));    
    }
    else{
        button = await driver.findElement(selenium.By.className(CANCEL_BUTTON_CLASSNAME));
    }

    try {
        await driver.actions().click(button).perform();
    }
    catch (e) {
        return `Error clicking element: ${e}`;
    }

    return SUCCESS_MESSAGE;
}

export async function verifyFlowUpdatedInFirebase(_: any, expectedFirebaseSize: number, expectedValue: string, componentName: string, shouldCheckText: boolean, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;

    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);

    if (!myComponents)
        return "Unable to find any components for session: " + mySession;

    if (myComponents.length !== expectedFirebaseSize)
        return `Expected ${expectedFirebaseSize} components but found ${myComponents.length}`;
    
    let myComponentCount = 0;

    for (var i = 0; i < expectedFirebaseSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.FLOW){
            myComponentCount++;

            const name = myComponents[i].getData().text;

            let value;

            if (shouldCheckText){
                value = myComponents[i].getData().text;
            }
            else{
                value = myComponents[i].getData().equation;
            }

            if (componentName === name && value !== expectedValue){
                return `Expected Firebase Flow to be ${expectedValue} but found: ${value}`; 
            }
            else{
                return SUCCESS_MESSAGE;
            }

        }        
    }
    
    return "Cannot find the Flow in Firebase"

}