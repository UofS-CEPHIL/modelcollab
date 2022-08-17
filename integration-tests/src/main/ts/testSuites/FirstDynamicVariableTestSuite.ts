import FirebaseInteractions from "../data/FirebaseInteractions";
import * as canvasConstants from "../canvasPage"


import {createDynamicVariable,verifyFirebaseWithDynamicVariableNumbers} from "../mode/dynamicvariableMode";
import { verifyStockUpdatedInFirebase,verifyDynamicVariableUpdatedInFirebase, editDynamicVariable } from "../mode/editMode";
import {moveDynamicVariable, verifyDynamicVariableLocationUpdatedInFirebase} from "../mode/moveMode"

export const FIRSTVAR_X = -10;
export const FIRSTVAR_Y = -10;

export const FIRSTVAR_EXPECTED_X = 586;
export const FIRSTVAR_EXPECTED_Y = 281;

const INITIAL_TEXT = "NewDynamicVar"

export async function createFirstDynamicVariable(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createDynamicVariable(driver,0,0);
}

export async function verifyFirebaseHasOneDynamicVariable(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithDynamicVariableNumbers(_, 1, dm);
}

export async function editFirstDynamicVariableText_NoSave(driver:any){
    return editDynamicVariable(driver, INITIAL_TEXT, canvasConstants.EDIT_BOX_NAME_CLASSNAME, false, 0,0);
}

export async function verifyFirstDynamicVariableTextDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyDynamicVariableUpdatedInFirebase(_, 12, INITIAL_TEXT, INITIAL_TEXT, true, dm);
}

export async function editFirstDynamicVariableText_Save(driver:any){
    return editDynamicVariable(driver, "Force Of Infection", canvasConstants.EDIT_BOX_NAME_CLASSNAME, true, 0,0);
}

export async function verifyFirstDynamicVariableTextUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyDynamicVariableUpdatedInFirebase(_, 12, "Force Of Infection", "Force Of Infection", true, dm);
}

export async function editFirstDynamicVariableValue_NoSave(driver: any){
    return editDynamicVariable(driver, "variable value", canvasConstants.EDIT_BOX_VALUE_CLASSNAME, false, 0,0);
}

export async function verifyFirstDynamicVariableValueDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyDynamicVariableUpdatedInFirebase(_, 12, "", "Force Of Infection", false, dm);
}

export async function editFirstDynamicVariableValue_Save(driver: any){
    return editDynamicVariable(driver, "variable value", canvasConstants.EDIT_BOX_VALUE_CLASSNAME, true, 0,0);
}

export async function verifyFirstDynamicVariableValueUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyDynamicVariableUpdatedInFirebase(_, 12,"variable value", "Force Of Infection", false, dm);
}


export async function moveFirstDynamicVariable(driver : any): Promise<string> {
    return await moveDynamicVariable(driver, FIRSTVAR_X, FIRSTVAR_Y);
}

export async function verifyFirstDynamicVariableLocationUpdatedInFirebase(_: any,dm? : FirebaseInteractions){
    return verifyDynamicVariableLocationUpdatedInFirebase(_,12, FIRSTVAR_EXPECTED_X,FIRSTVAR_EXPECTED_Y,"Force Of Infection",dm);
}