import FirebaseInteractions from "../data/FirebaseInteractions";

import {createConnection, verifyFirebaseWithConnectionNumbers} from "../mode/connectMode"
import { moveConnection } from "../mode/moveMode";
import {FIRSTSTOCK_X,FIRSTSTOCK_Y} from "./FirstStockTestSuite";

const WIDTH_PX = 100;
const HEIGHT_PX = 70;

const SOURCE_X = FIRSTSTOCK_X + WIDTH_PX/2
const SOURCE_Y = FIRSTSTOCK_Y + HEIGHT_PX/2 + 1

const DESTINATION_X = SOURCE_X
const DESTINATION_Y = SOURCE_Y + 50

function computeVerticalFlowCordinates(stockXOffset: number, stockYOffset:number): {y: number, x: number} {
    return {x: stockXOffset + WIDTH_PX/2, y: stockYOffset + HEIGHT_PX + 2}
}

export async function createSecondConnection(driver: any): Promise<string> {
    // const {x,y} = await getCanvasCords(driver, 0,0);
    const flowCords = computeVerticalFlowCordinates(FIRSTSTOCK_X,FIRSTSTOCK_Y);
    return await createConnection(driver,{XOffset: FIRSTSTOCK_X, YOffset: FIRSTSTOCK_Y},{XOffset: flowCords.x, YOffset: flowCords.y});
}

export async function verifyFirebaseHasTwoConnections(_: any, dm?: FirebaseInteractions): Promise<string> {
    return verifyFirebaseWithConnectionNumbers(_, 2, dm);
}

export async function moveSecondConnection(driver : any): Promise<string> {
    return await moveConnection(driver, {x: SOURCE_X, y: SOURCE_Y}, {x: DESTINATION_X, y: DESTINATION_Y});
}