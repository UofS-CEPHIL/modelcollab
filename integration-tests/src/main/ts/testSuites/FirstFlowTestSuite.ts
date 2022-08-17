import FirebaseInteractions from "../data/FirebaseInteractions";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "../doTests";
import * as canvasConstants from "../canvasPage"


import {createFlow,verifyFirebaseWithFlowNumbers} from "../mode/flowMode";
import { editFlow, verifyFlowUpdatedInFirebase} from "../mode/editMode";

import {FIRSTSTOCK_X,FIRSTSTOCK_Y} from "./FirstStockTestSuite";
import {SECONDSTOCK_X,SECONDSTOCK_Y} from "./SecondStockTestSuite";

const WIDTH_PX = 100;
const HEIGHT_PX = 70

function computeHorizontalFlowCordinates(stockXOffset: number, stockYOffset:number): {y: number, x: number} {
    return {x: stockXOffset + WIDTH_PX + 5, y: stockYOffset + HEIGHT_PX/2}
}

export async function createFirstFlow(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createFlow(driver,{XOffset: FIRSTSTOCK_X, YOffset: FIRSTSTOCK_Y},{XOffset: SECONDSTOCK_X, YOffset: SECONDSTOCK_Y});
}

export async function verifyFirebaseHasOneFlow(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithFlowNumbers(_, 1, dm);
}


export async function editFirstFlowText_Save(driver:any){
    const flowCords = computeHorizontalFlowCordinates(FIRSTSTOCK_X,FIRSTSTOCK_Y);

    return editFlow(driver, "Incidence", canvasConstants.EDIT_BOX_NAME_CLASSNAME, true, flowCords.x, flowCords.y);
}

export async function verifyFirstFlowTextUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 3,"Incidence", "Incidence", true, dm);
}

export async function editFirstFlowEquation_NoSave(driver: any){
    const flowCords = computeHorizontalFlowCordinates(FIRSTSTOCK_X,FIRSTSTOCK_Y);

    return editFlow(driver, "", canvasConstants.EDIT_BOX_EQUATION_CLASSNAME, false, flowCords.x, flowCords.y);
}

export async function verifyFirstFlowEquationDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 3, "", "Incidence", false, dm);
}

export async function editFirstFlowEquation_Save(driver: any){
    const flowCords = computeHorizontalFlowCordinates(FIRSTSTOCK_X,FIRSTSTOCK_Y);

    return editFlow(driver, "First Flow Equation", canvasConstants.EDIT_BOX_EQUATION_CLASSNAME, true, flowCords.x, flowCords.y);
}
export async function verifyFirstFlowEquationUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 3,"First Flow Equation", "Incidence", false, dm);
}


