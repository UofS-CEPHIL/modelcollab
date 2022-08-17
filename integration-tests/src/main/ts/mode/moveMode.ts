import FirebaseInteractions from "../data/FirebaseInteractions";
import {FirebaseComponentModel as schema} from "database/build/export";
import { dragElementByOffset, dragElementFromSpecifiedPostionToOffset, selenium, SUCCESS_MESSAGE} from "../doTests";
import * as canvasConstants from "../canvasPage"

export async function moveStock(driver: any,xOffset: number , yOffset: number ): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    return await dragElementByOffset(driver, canvas, xOffset,yOffset );
}

export async function verifyStockLocationUpdatedInFirebase(_: any, expectedSize: number, expectedX: number, expectedY: number, componentName: string, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== expectedSize)
        return `Expected ${expectedSize} components but found ${myComponents.length}`;
    

    for (var i = 0; i < expectedSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.STOCK){

            const name = myComponents[i].getData().text;
            const x = myComponents[i].getData().x;
            const y = myComponents[i].getData().y;
    
            if (componentName === name && (x !== expectedX || y != expectedY)){
                return `Expected Firebase Stock to be "${expectedX}, ${expectedY}" but found: "${x},${y}"`; 
            }
            else if (componentName === name && (x == expectedX || y == expectedY)){
                return SUCCESS_MESSAGE;
            }

        }        
    }
    return "Cannot find the component in Firebase"
}

export async function moveCloud(driver: any,xOffset: number , yOffset: number ): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    return await dragElementByOffset(driver, canvas, xOffset,yOffset );
};

export async function verifyCloudLocationUpdatedInFirebase(_: any, expectedSize: number, expectedX: number, expectedY: number, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== expectedSize)
        return `Expected ${expectedSize} components but found ${myComponents.length}`;
    
    let myComponentCount = 0;

    for (var i = 0; i < expectedSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.CLOUD){
            myComponentCount++;

            const x = myComponents[i].getData().x;
            const y = myComponents[i].getData().y;
    
            if ((x !== expectedX || y != expectedY)){
                return `Expected Firebase Cloud to be "${expectedX}, ${expectedY}" but found: "${x},${y}"`; 
            }
        }        
    }
    if (myComponentCount === 0){
        return "Cannot find the component in Firebase"
    }
    return SUCCESS_MESSAGE;
}

export async function moveParameter(driver: any,xOffset: number , yOffset: number ): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    return await dragElementByOffset(driver, canvas, xOffset,yOffset );
}

export async function verifyParameterLocationUpdatedInFirebase(_: any, expectedSize: number, expectedX: number, expectedY: number, componentName: string, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== expectedSize)
        return `Expected ${expectedSize} components but found ${myComponents.length}`;
    

    for (var i = 0; i < expectedSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.PARAMETER){

            const name = myComponents[i].getData().text;
            const x = myComponents[i].getData().x;
            const y = myComponents[i].getData().y;
    
            if (componentName === name && (x !== expectedX || y != expectedY)){
                return `Expected Firebase Parameter to be "${expectedX}, ${expectedY}" but found: "${x},${y}"`; 
            }
            else if (componentName === name && (x == expectedX || y == expectedY)){
                return SUCCESS_MESSAGE;
            }

        }        
    }
    return "Cannot find the component in Firebase"
}

export async function moveDynamicVariable(driver: any,xOffset: number , yOffset: number ): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    return await dragElementByOffset(driver, canvas, xOffset,yOffset );
}

export async function verifyDynamicVariableLocationUpdatedInFirebase(_: any, expectedSize: number, expectedX: number, expectedY: number, componentName: string, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== expectedSize)
        return `Expected ${expectedSize} components but found ${myComponents.length}`;
    
    for (var i = 0; i < expectedSize; i ++){
        if (myComponents[i].getType() === schema.ComponentType.VARIABLE){

            const name = myComponents[i].getData().text;
            const x = myComponents[i].getData().x;
            const y = myComponents[i].getData().y;
    
            if (componentName === name && (x !== expectedX || y != expectedY)){
                return `Expected Firebase Dynamic Variable to be "${expectedX}, ${expectedY}" but found: "${x},${y}"`; 
            }
            else if (componentName === name && (x == expectedX || y == expectedY)){
                return SUCCESS_MESSAGE;
            }

        }        
    }
    return "Cannot find the component in Firebase"
}

export async function moveConnection(driver: any, source : {x: number , y: number}, destination : {x: number , y: number} ): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    return await dragElementFromSpecifiedPostionToOffset(driver, canvas, source, destination );
}