import FirebaseInteractions from "../data/FirebaseInteractions";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "../doTests";
import * as canvasConstants from "../canvasPage"


import {createStock,verifyFirebaseWithStockNumbers} from "../mode/stockMode";
import { editStock, verifyStockUpdatedInFirebase } from "../mode/editMode";
import {moveStock, verifyStockLocationUpdatedInFirebase} from "../mode/moveMode"

export const FIRSTSTOCK_X = -596;
export const FIRSTSTOCK_Y = 100;

export const FIRSTSTOCK_EXPECTED_X = 0;
export const FIRSTSTOCK_EXPECTED_Y = 391;

export async function createFirstStock(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createStock(driver,0,0);
}

export async function verifyFirebaseHasOneStock(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithStockNumbers(_, 1, dm);
}


export async function editFirstStockText_Save(driver:any){
    return editStock(driver, "S", canvasConstants.EDIT_BOX_NAME_CLASSNAME, true, 0,0);
}

export async function verifyFirstStockTextUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 1,"S", "S", true, dm);
}

export async function editFirstStockInitValue_NoSave(driver: any){
    return editStock(driver, "90", canvasConstants.EDIT_BOX_INITVAL_CLASSNAME, false, 0,0);
}

export async function verifyFirstStockInitValueDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 1, "", "S", false, dm);
}

export async function editFirstStockInitValue_Save(driver: any){
    return editStock(driver, "90", canvasConstants.EDIT_BOX_INITVAL_CLASSNAME, true, 0,0);
}

export async function verifyFirstStockInitValueUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 1,"90", "S", false, dm);
}


export async function moveFirstStock(driver : any): Promise<string> {
    return await moveStock(driver, FIRSTSTOCK_X, FIRSTSTOCK_Y);
}

export async function verifyFirstStockLocationUpdatedInFirebase(_: any,dm? : FirebaseInteractions){
    return verifyStockLocationUpdatedInFirebase(_,1,FIRSTSTOCK_EXPECTED_X,FIRSTSTOCK_EXPECTED_Y,"S",dm);
}