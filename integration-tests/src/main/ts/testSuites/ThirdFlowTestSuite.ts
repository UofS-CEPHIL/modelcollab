import FirebaseInteractions from "../data/FirebaseInteractions";
import * as canvasConstants from "../canvasPage"


import {createFlow,verifyFirebaseWithFlowNumbers} from "../mode/flowMode";
import { editFlow, verifyFlowUpdatedInFirebase} from "../mode/editMode";

import {FIRSTSTOCK_X,FIRSTSTOCK_Y} from "./FirstStockTestSuite";
import {FIRSTCLOUD_X,FIRSTCLOUD_Y} from "./FirstCloudTestSuite";

const WIDTH_PX = 100;
const HEIGHT_PX = 70

function computeVerticalFlowCordinates(stockXOffset: number, stockYOffset:number): {y: number, x: number} {
    return {x: stockXOffset + WIDTH_PX/2, y: stockYOffset + HEIGHT_PX + 5}
}

export async function createThirdFlow(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createFlow(driver,{XOffset: FIRSTSTOCK_X, YOffset: FIRSTSTOCK_Y},{XOffset: FIRSTCLOUD_X, YOffset: FIRSTCLOUD_Y});
}

export async function verifyFirebaseHasThreeFlows(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithFlowNumbers(_, 3, dm);
}


export async function editThirdFlowText_Save(driver:any){
    const flowCords = computeVerticalFlowCordinates(FIRSTSTOCK_X,FIRSTSTOCK_Y);

    return editFlow(driver, "Susceptible", canvasConstants.EDIT_BOX_NAME_CLASSNAME, true, flowCords.x, flowCords.y);
}

export async function verifyThirdFlowTextUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 8,"Susceptible", "Susceptible", true, dm);
}

export async function editThirdFlowEquation_NoSave(driver: any){
    const flowCords = computeVerticalFlowCordinates(FIRSTSTOCK_X,FIRSTSTOCK_Y);

    return editFlow(driver, "", canvasConstants.EDIT_BOX_EQUATION_CLASSNAME, false, flowCords.x, flowCords.y);
}

export async function verifyThirdFlowEquationDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 8, "", "Susceptible", false, dm);
}

export async function editThirdFlowEquation_Save(driver: any){
    const flowCords = computeVerticalFlowCordinates(FIRSTSTOCK_X,FIRSTSTOCK_Y);

    return editFlow(driver, "Third Flow Equation", canvasConstants.EDIT_BOX_EQUATION_CLASSNAME, true, flowCords.x, flowCords.y);
}
export async function verifyThirdFlowEquationUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyFlowUpdatedInFirebase(_, 8,"Third Flow Equation", "Susceptible", false, dm);
}