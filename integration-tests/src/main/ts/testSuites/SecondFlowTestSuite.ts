import FirebaseInteractions from "../data/FirebaseInteractions";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "../doTests";
import * as canvasConstants from "../canvasPage"


import {createFlow,verifyFirebaseWithFlowNumbers} from "../mode/flowMode";
import { editFlow, verifyFlowUpdatedInFirebase} from "../mode/editMode";

import {SECONDSTOCK_X,SECONDSTOCK_Y} from "./SecondStockTestSuite";
import {THIRDSTOCK_X,THIRDSTOCK_Y} from "./ThirdStockTestSuite";


const WIDTH_PX = 100;
const HEIGHT_PX = 70

function computeHorizontalFlowCordinates(stockXOffset: number, stockYOffset:number): {y: number, x: number} {
    return {x: stockXOffset + WIDTH_PX + 5, y: stockYOffset + HEIGHT_PX/2}
}


export async function createSecondFlow(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createFlow(driver,{XOffset: SECONDSTOCK_X, YOffset: SECONDSTOCK_Y},{XOffset: THIRDSTOCK_X, YOffset: THIRDSTOCK_Y});
}

export async function verifyFirebaseHasTwoFlow(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithFlowNumbers(_, 2, dm);
}


export async function editSecondFlowText_NoSave(driver:any){
    const flowCords = computeHorizontalFlowCordinates(SECONDSTOCK_X,SECONDSTOCK_Y);

    return editFlow(driver, "Recovery", canvasConstants.EDIT_BOX_NAME_CLASSNAME, false, flowCords.x, flowCords.y);
}

export async function verifySecondFlowTextDidNotUpdatInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 5,"", "", true, dm);
}

export async function editSecondFlowText_Save(driver:any){
    const flowCords = computeHorizontalFlowCordinates(SECONDSTOCK_X,SECONDSTOCK_Y);

    return editFlow(driver, "Recovery", canvasConstants.EDIT_BOX_NAME_CLASSNAME, true, flowCords.x, flowCords.y);
}

export async function verifySecondFlowTextUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 5,"Recovery", "Recovery", true, dm);
}

export async function editSecondFlowEquation_NoSave(driver: any){
    const flowCords = computeHorizontalFlowCordinates(SECONDSTOCK_X,SECONDSTOCK_Y);

    return editFlow(driver, "", canvasConstants.EDIT_BOX_EQUATION_CLASSNAME, false, flowCords.x, flowCords.y);
}

export async function verifySecondFlowEquationDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 5, "", "Recovery", false, dm);
}

export async function editSecondFlowEquation_Save(driver: any){
    const flowCords = computeHorizontalFlowCordinates(SECONDSTOCK_X,SECONDSTOCK_Y);

    return editFlow(driver, "Second Flow Equation", canvasConstants.EDIT_BOX_EQUATION_CLASSNAME, true, flowCords.x, flowCords.y);
}

export async function verifySecondFlowEquationUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 5,"Second Flow Equation", "Recovery", false, dm);
}