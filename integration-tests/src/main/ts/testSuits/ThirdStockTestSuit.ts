import FirebaseInteractions from "../data/FirebaseInteractions";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "../doTests";
import * as canvasConstants from "../canvasPage"


import {createStock,verifyFirebaseWithStockNumbers} from "../mode/stockMode";
import {editStock, verifyFlowUpdatedInFirebase, verifyStockUpdatedInFirebase } from "../mode/editMode";
import {moveStock, verifyStockLocationUpdatedInFirebase} from "../mode/moveMode"

export const THIRDSTOCK_X = 100;
export const THIRDSTOCK_Y = 100;

export const THIRDSTOCK_EXPECTED_X = 696;
export const THIRDSTOCK_EXPECTED_Y = 392;

export async function createThirdStock(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createStock(driver,0,0);
}

export async function verifyFirebaseHasThreeStock(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithStockNumbers(_, 3, dm);
}


export async function editThirdStockText_Save(driver:any){
    return editStock(driver, "R", canvasConstants.EDIT_BOX_NAME_CLASSNAME, true, 0,0);
}

export async function verifyThirdStockTextUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 4,"R", "R", true, dm);
}

export async function editThirdStockInitValue_NoSave(driver: any){
    return editStock(driver, "140", canvasConstants.EDIT_BOX_INITVAL_CLASSNAME, false, 0,0);
}

export async function verifyThirdStockInitValueDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 4, "", "R", false, dm);
}

export async function editThirdStockInitValue_Save(driver: any){
    return editStock(driver, "140", canvasConstants.EDIT_BOX_INITVAL_CLASSNAME, true, 0,0);
}

export async function verifyThirdStockInitValueUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyStockUpdatedInFirebase(_, 4,"140", "R", false, dm);
}

export async function moveThirdStock(driver : any): Promise<string> {
    return await moveStock(driver, THIRDSTOCK_X, THIRDSTOCK_Y);
}

export async function verifyThirdStockLocationUpdatedInFirebase(_: any,dm? : FirebaseInteractions){
    return verifyStockLocationUpdatedInFirebase(_,4,THIRDSTOCK_EXPECTED_X,THIRDSTOCK_EXPECTED_Y,"R",dm);
}