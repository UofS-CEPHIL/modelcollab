import FirebaseInteractions from "../data/FirebaseInteractions";

import {createCloud,verifyFirebaseWithCloudNumbers} from "../mode/cloudMode";
import {moveCloud, verifyCloudLocationUpdatedInFirebase} from "../mode/moveMode"
import { FIRSTSTOCK_EXPECTED_X, FIRSTSTOCK_EXPECTED_Y, FIRSTSTOCK_X, FIRSTSTOCK_Y } from "./FirstStockTestSuite";

export const FIRSTCLOUD_X = FIRSTSTOCK_X + 50;
export const FIRSTCLOUD_Y = FIRSTSTOCK_Y + 180;

export const FIRSTCLOUD_EXPECTED_X = FIRSTSTOCK_EXPECTED_X + 50;
export const FIRSTCLOUD_EXPECTED_Y = FIRSTSTOCK_EXPECTED_Y + 180;

export async function createFirstCloud(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);

    return await createCloud(driver,0,0);
}

export async function verifyFirebaseHasOneCloud(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithCloudNumbers(_, 1, dm);
}

export async function moveFirstCloud(driver : any): Promise<string> {
    return await moveCloud(driver, FIRSTCLOUD_X, FIRSTCLOUD_Y);
}

export async function verifyFirstCloudLocationUpdatedInFirebase(_: any,dm? : FirebaseInteractions){
    return verifyCloudLocationUpdatedInFirebase(_,7,FIRSTCLOUD_EXPECTED_X,FIRSTCLOUD_EXPECTED_Y,dm);
}