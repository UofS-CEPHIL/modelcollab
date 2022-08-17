import FirebaseInteractions from "../data/FirebaseInteractions";
import {FirebaseComponentModel as schema} from "database/build/export";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "../doTests";
import * as canvasConstants from "../canvasPage"

export async function createConnection(driver: any, from: {XOffset: number , YOffset: number}, to: {XOffset: number, YOffset: number}): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    const message = await clickElementWithOffset(driver,canvas, from.XOffset, from.YOffset);
    if (message === SUCCESS_MESSAGE){
        return await clickElementWithOffset(driver,canvas,to.XOffset,to.YOffset)
    }
    return message;
}

export async function verifyFirebaseWithConnectionNumbers(_: any, expectedSize: number, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;

    let count = 0;
    for (var i = 0; i < myComponents.length; i ++){
        const myComponent = myComponents[i];
        if (myComponent.getType() === schema.ComponentType.CONNECTION)
            count++;
    }

    if (count != expectedSize){
        return `Expected ${expectedSize} connection(s) but found ${count}`;
    }

    return SUCCESS_MESSAGE;
}