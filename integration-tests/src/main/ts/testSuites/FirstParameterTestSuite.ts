import FirebaseInteractions from "../data/FirebaseInteractions";
import * as canvasConstants from "../canvasPage"


import {createParameter,verifyFirebaseWithParameterNumbers} from "../mode/parameterMode";
import { editParameter, editStock, verifyStockUpdatedInFirebase, editParameterTextInFirebase, verifyParameterUpdatedInFirebase } from "../mode/editMode";
import {moveParameter, verifyParameterLocationUpdatedInFirebase} from "../mode/moveMode"

export const FIRSTPARAMETER_X = -200;
export const FIRSTPARAMETER_Y = 210;

export const FIRSTPARAMETER_EXPECTED_X = 396;
export const FIRSTPARAMETER_EXPECTED_Y = 501;

const INITIAL_TEXT = "NewParam"

export async function createFirstParameter(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createParameter(driver,0,0);
}

export async function verifyFirebaseHasOneParameter(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithParameterNumbers(_, 1, dm);
}

export async function editFirstParameterTextInFirebase(dm?: FirebaseInteractions): Promise<string> {
    return editParameterTextInFirebase("", dm);
}
export async function editFirstParameterText_NoSave(driver:any){
    return editParameter(driver, INITIAL_TEXT, canvasConstants.EDIT_BOX_NAME_CLASSNAME, false, 0,0);
}

export async function verifyFirstParameterTextDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyParameterUpdatedInFirebase(_, 10, INITIAL_TEXT, INITIAL_TEXT, true, dm);
}

export async function editFirstParameterText_Save(driver:any){
    return editParameter(driver, "Mortality Rate", canvasConstants.EDIT_BOX_NAME_CLASSNAME, true, 0,0);
}

export async function verifyFirstParameterTextUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyParameterUpdatedInFirebase(_, 10,"Mortality Rate", "Mortality Rate", true, dm);
}

export async function editFirstParameterValue_NoSave(driver: any){
    return editParameter(driver, "parameter value", canvasConstants.EDIT_BOX_VALUE_CLASSNAME, false, 0,0);
}

export async function verifyFirstParameterValueDidNotUpdateInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyParameterUpdatedInFirebase(_, 10, "", "Mortality Rate", false, dm);
}

export async function editFirstParameterValue_Save(driver: any){
    return editParameter(driver, "parameter value", canvasConstants.EDIT_BOX_VALUE_CLASSNAME, true, 0,0);
}

export async function verifyFirstParameterValueUpdatedInFirebase(_: any, dm?: FirebaseInteractions){
    return verifyParameterUpdatedInFirebase(_, 10,"parameter value", "Mortality Rate", false, dm);
}


export async function moveFirstParameter(driver : any): Promise<string> {
    return await moveParameter(driver, FIRSTPARAMETER_X, FIRSTPARAMETER_Y);
}

export async function verifyFirstParameterLocationUpdatedInFirebase(_: any,dm? : FirebaseInteractions){
    return verifyParameterLocationUpdatedInFirebase(_,10,FIRSTPARAMETER_EXPECTED_X,FIRSTPARAMETER_EXPECTED_Y,"Mortality Rate",dm);
}