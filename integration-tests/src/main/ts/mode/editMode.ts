import FirebaseInteractions from "../data/FirebaseInteractions";
import {FirebaseComponentModel as schema} from "database/build/export";
import { clickElementWithOffset, selenium, SUCCESS_MESSAGE} from "../doTests";
import * as canvasConstants from "../canvasPage"

const SAVE_BUTTON_CLASSNAME = "MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButtonBase-root Save css-sghohy-MuiButtonBase-root-MuiButton-root";
const CANCEL_BUTTON_CLASSNAME = "MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButtonBase-root Cancel css-sghohy-MuiButtonBase-root-MuiButton-root";

const COMMAND = "\ue03D";
const DELETE = "\ue017";
const BACKSPACE = "\ue003";
const CTRL = "\ue009";

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
    dm
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== expectedFirebaseSize)
        return `Expected ${expectedFirebaseSize} components but found ${myComponents.length}`;
    

    for (var i = 0; i < expectedFirebaseSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.STOCK){

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

            else if (componentName === name && value == expectedValue){
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
    

    for (var i = 0; i < expectedFirebaseSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.FLOW){

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
            else if (componentName === name && value == expectedValue){
                return SUCCESS_MESSAGE;
            }

        }        
    }
    
    return "Cannot find the Flow in Firebase"

}


export async function editParameterTextInFirebase(inputText: string,dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();

    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];

    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
    return "Unable to find any components for session: " + mySession;
    
    let component;
    for (var i = 0; i < myComponents.length; i++){
        if ((myComponents[i].getType() === schema.ComponentType.PARAMETER)){
                component = myComponents[i];
        }
    
    }

    if (!component){
        return "Cannot find the Parameter that were created by Canvas in the Firebase";
    }
    const newData = new schema.ParameterFirebaseComponent(
        component.getId(),
        {
            text: inputText,
            value: "",
            x: component.getData().x,
            y: component.getData().y, 
        }
    );
    dm.updateComponent(mySession, newData);

    return SUCCESS_MESSAGE;
}

export async function editParameter(driver: any, value: string, className: any, shouldSave: boolean, xOffset:number , yOffset:number): Promise<string> {

    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    const message = await clickElementWithOffset(driver,canvas, xOffset,yOffset);

    if ( message != SUCCESS_MESSAGE){
        return message
    }

    let mui_textfield;
    try{
        mui_textfield = await driver.wait(selenium.until.elementLocated(selenium.By.className(className)),100);
    }
    catch (e){
        return `Error: ${e}`;
    }

    await mui_textfield.sendKeys(await selenium.Key.chord(selenium.Key.COMMAND, "a"), selenium.Key.DELETE);
    mui_textfield = await driver.findElement(selenium.By.className(className))    
    let textField = await mui_textfield.getAttribute("value");
    if (textField !== "")
        return `Expected Parameter to be empty but found "${textField}"`;
  
    mui_textfield.sendKeys(value.toString());    
    mui_textfield = await driver.findElement(selenium.By.className(className))    
    textField = await mui_textfield.getAttribute("value");

    if (textField !== value.toString())
        return `Expected Parameter to have "${value.toString()}" but found "${textField}"`;
        
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

export async function verifyParameterUpdatedInFirebase(_: any, expectedFirebaseSize: number, expectedValue: string, componentName: string, shouldCheckText: boolean, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    dm
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== expectedFirebaseSize)
        return `Expected ${expectedFirebaseSize} components but found ${myComponents.length}`;
    for (var i = 0; i < expectedFirebaseSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.PARAMETER){

            const name = myComponents[i].getData().text;

            let value;

            if (shouldCheckText){
                value = myComponents[i].getData().text;
            }
            else{
                value = myComponents[i].getData().value;
            }

            if (componentName === name && value !== expectedValue){
                return `Expected Firebase Parameter to be "${expectedValue}" but found: "${value}"`; 
            }

            else if (componentName === name && value == expectedValue){
                return SUCCESS_MESSAGE;
            }
        }        
    }
    return "Cannot find the Parameter in Firebase"
}

export async function editDynamicVariable(driver: any, value: string, className: any, shouldSave: boolean, xOffset:number , yOffset:number): Promise<string> {

    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    const message = await clickElementWithOffset(driver,canvas, xOffset,yOffset);

    if ( message != SUCCESS_MESSAGE){
        return message
    }

    let mui_textfield;
    try{
        mui_textfield = await driver.wait(selenium.until.elementLocated(selenium.By.className(className)),100);
    }
    catch (e){
        return `Error: ${e}`;
    }

    await mui_textfield.sendKeys(await selenium.Key.chord(selenium.Key.COMMAND, "a"), selenium.Key.DELETE);
    mui_textfield = await driver.findElement(selenium.By.className(className))    
    let textField = await mui_textfield.getAttribute("value");
    if (textField !== "")
        return `Expected Dynamic Variable to be empty but found "${textField}"`;
  
    mui_textfield.sendKeys(value.toString());    
    mui_textfield = await driver.findElement(selenium.By.className(className))    
    textField = await mui_textfield.getAttribute("value");

    if (textField !== value.toString())
        return `Expected Dynamic Variable to have "${value.toString()}" but found "${textField}"`;
        
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

export async function verifyDynamicVariableUpdatedInFirebase(_: any, expectedFirebaseSize: number, expectedValue: string, componentName: string, shouldCheckText: boolean, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    dm
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== expectedFirebaseSize)
        return `Expected ${expectedFirebaseSize} components but found ${myComponents.length}`;

    for (var i = 0; i < expectedFirebaseSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.VARIABLE){

            const name = myComponents[i].getData().text;

            let value;

            if (shouldCheckText){
                value = myComponents[i].getData().text;
            }
            else{
                value = myComponents[i].getData().value;
            }

            if (componentName === name && value !== expectedValue){
                return `Expected Firebase Dynamic Variable to be "${expectedValue}" but found: "${value}"`; 
            }

            else if (componentName === name && value == expectedValue){
                return SUCCESS_MESSAGE;
            }
        }        
    }
    return "Cannot find the Dynamic Variable in Firebase"
}