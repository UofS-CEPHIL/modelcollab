import FirebaseInteractions from "../data/FirebaseInteractions";
import {FirebaseComponentModel as schema} from "database/build/export";
import { clickElementWithOffset, selenium, SUCCESS_MESSAGE } from "../doTests";
import * as canvasConstants from "../canvasPage"

export async function createStock(driver: any, xOffset: number , yOffset: number): Promise<string> {
    const canvas = await driver.findElement(selenium.By.className(canvasConstants.CANVAS_CLASSNAME));
    const message = await clickElementWithOffset(driver,canvas, xOffset,yOffset);
    return message;
}

export async function verifyFirebaseWithStockNumbers(_: any, expectedSize: number, dm?: FirebaseInteractions): Promise<string> {
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
        if (myComponent.getType() === schema.ComponentType.STOCK)
            count++;
    }

    if (count != expectedSize){
        return `Expected ${expectedSize} stock(s) but found ${count}`;
    }

    return SUCCESS_MESSAGE;
}
