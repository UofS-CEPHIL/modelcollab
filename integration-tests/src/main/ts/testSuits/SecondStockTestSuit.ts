import FirebaseInteractions from "../data/FirebaseInteractions";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "../doTests";
import * as canvasConstants from "../canvasPage"


import {createStock,verifyFirebaseWithStockNumbers} from "../mode/stockMode";
import { editStock, verifyFlowUpdatedInFirebase, verifyStockUpdatedInFirebase } from "../mode/editMode";
import {moveStock, verifyStockLocationUpdatedInFirebase} from "../mode/moveMode"

export const SECONDSTOCK_X = -200;
export const SECONDSTOCK_Y = 100;

export const SECONDSTOCK_EXPECTED_X = 396;
export const SECONDSTOCK_EXPECTED_Y = 392;


export async function createSecondStock(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createStock(driver,0,0);
}

export async function verifyFirebaseHasTwoStock(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithStockNumbers(_, 2, dm);
}


export async function editSecondStockText_NoSave(driver:any){
    return editStock(driver, "I", canvasConstants.EDIT_BOX_NAME_CLASSNAME, false, 0,0);
}

export async function verifySecondStockTextDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 2,"", "", true, dm);
}

export async function editSecondStockText_Save(driver:any){
    return editStock(driver, "I", canvasConstants.EDIT_BOX_NAME_CLASSNAME, true, 0,0);
}

export async function verifySecondStockTextUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 2,"I", "I", true, dm);
}

export async function editSecondStockInitValue_NoSave(driver: any){
    return editStock(driver, "70", canvasConstants.EDIT_BOX_INITVAL_CLASSNAME, false, 0,0);
}

export async function verifySecondStockInitValueDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 2, "", "I", false, dm);
}

export async function editSecondStockInitValue_Save(driver: any){
    return editStock(driver, "70", canvasConstants.EDIT_BOX_INITVAL_CLASSNAME, true, 0,0);
}

export async function verifySecondStockInitValueUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 2,"70", "I", false, dm);
}


export async function moveSecondStock(driver : any): Promise<string> {
    return await moveStock(driver, SECONDSTOCK_X, SECONDSTOCK_Y);
}

export async function verifySecondStockLocationUpdatedInFirebase(_: any,dm? : FirebaseInteractions){
    return verifyStockLocationUpdatedInFirebase(_,2,SECONDSTOCK_EXPECTED_X,SECONDSTOCK_EXPECTED_Y,"I",dm);
}