// import { ComponentType, FirebaseDataComponent, StockFirebaseComponent } from "database/build/export";
import {FirebaseComponentModel as schema} from "database/build/export"
import { ComponentType } from "database/build/FirebaseComponentModel";
import { browserLocalPersistence } from "firebase/auth";
// import FirebaseDataModel from "../../main/ts/data/FirebaseDataModel";
// import FirebaseTestingDataModel from "../../main/ts/data/FirebaseTestingDataModel";
import FirebaseInteractions from "./data/FirebaseInteractions";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "./doTests";

const CANVAS_ID = "canvas-div";
const TOOLBAR_ID = "toolbar-box";
const BUTTON_CLASSNAME = "MuiButton-root MuiButton-contained MuiButton-containedPrimary MuiButton-sizeMedium MuiButton-containedSizeMedium MuiButtonBase-root  css-sghohy-MuiButtonBase-root-MuiButton-root";
const STOCK_MUITEXTFIELD_CLASSNAME = "MuiInput-input MuiInputBase-input Mui_Stock css-1x51dt5-MuiInputBase-input-MuiInput-input";
const FLOW_MUITEXTFIELD_CLASSNAME = "MuiOutlinedInput-input MuiInputBase-input MuiInputBase-inputSizeSmall Mui_Flow css-1n4twyu-MuiInputBase-input-MuiOutlinedInput-input";

const EDIT_BOX_INITVAL_CLASSNAME = "MuiOutlinedInput-input MuiInputBase-input Mui_InitVal css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input";
const EDIT_BOX_DEPENDSON_CLASSNAME = "MuiOutlinedInput-input MuiInputBase-input Mui_DependsOn css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input";
const EDIT_BOX_EQUATION_CLASSNAME = "MuiOutlinedInput-input MuiInputBase-input Mui_Equation css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input";

const EDITMODE_INITVAL = "InitVal";
const EDITMODE_DEPENDSON = "DependsOn";
const EDITMODE_EQUATION = "Equation";

const STOCK_CLASSNAME = "stock-div";
const STOCK_COMPONENT_ID = "999";
const STOCK_COMPONENT2_ID = "888";

const STOCK_1_TEXT = "S";
const STOCK_2_TEXT = "I";
const STOCK_3_TEXT = "R";
const MORE_TEXT = "moretext";

const STOCK_1_INITVAL = 90;
const STOCK_2_INITVAL = 80;
const STOCK_3_INITVAL = 70;


const FLOW_CLASSNAME = "flow-div";
const FLOW_SVG_CLASSNAME = "Flow-svg";
const FLOW_COMPONENT_ID = "777";
const FLOW_SECOND_HALF_LINE_CLASSNAME = "Flow-line-inner-second-half";
const FLOW_1_TEXT = "Infection";
const FLOW_2_TEXT = "Hospital";

const FLOW_1_EQUATION = "Some Equation for Flow 1";
const FLOW_2_EQUATION = "Some Equation for Flow 2";

const OFFSET_PX = 250;
const XOFFSET_PX_STOCK1 = 0;
const XOFFSET_PX_STOCK3 = 900;

const EXPECTED_TITLE = "ModelCollab";

const BLACK = "rgb(0, 0, 0)"
const RED = "rgb(255, 0, 0)"

const getStock = async (driver: any) =>
    await driver.findElement(selenium.By.className(STOCK_CLASSNAME));

const getMuiTextField = async (driver: any, type: string, Mode: string = "", ) =>{

    if (Mode === "")
        if (type === schema.ComponentType.STOCK){
            return await driver.findElement(selenium.By.className(STOCK_MUITEXTFIELD_CLASSNAME));
        }
        else{
            return await driver.findElement(selenium.By.className(FLOW_MUITEXTFIELD_CLASSNAME));
        }

    else if (Mode === EDITMODE_INITVAL){
        return await driver.findElement(selenium.By.className(EDIT_BOX_INITVAL_CLASSNAME));
    }
    else if (Mode === EDITMODE_DEPENDSON){
        return await driver.findElement(selenium.By.className(EDIT_BOX_DEPENDSON_CLASSNAME));
    }
    else if (Mode === EDITMODE_EQUATION){
        return await driver.findElement(selenium.By.className(EDIT_BOX_EQUATION_CLASSNAME));
    }
}

async function getSelectedToolbarTabId(driver: any): Promise<string | null> {
    try {
        const selectedTab = await driver.findElement(selenium.By.className("Mui-selected"));
        return selectedTab.getAttribute("id");
    }
    catch (e) {
        return null;
    }
}

async function checkStockBorderColor(stock: any, expectedColour: string) {
    if (!stock) return "Unable to find stock.";
    
    try {
        const colour = await stock.getCssValue("border");
        if (!colour.toLowerCase().includes(expectedColour))
            return `Expected selected stock to be ${expectedColour} but found: ${colour}`;
        return SUCCESS_MESSAGE;
    }
    catch (e) {
        return "Encountered error";
    }
}


async function verifyCanvasIsInMode(driver: any, mode: string): Promise<string> {
    const selectedId = await getSelectedToolbarTabId(driver);
    if (selectedId === "")
        return "Selected toolbar tab had blank ID.";
    if (!selectedId)
        return "Unable to find selected toolbar tab.";
    else if (selectedId !== mode + "-tab")
        return `Expected Canvas to be in ${mode} mode but found: ${selectedId}.`;
    else
        return SUCCESS_MESSAGE;
}

async function verifyPageHasCorrectTitle(driver: any): Promise<string> {
    return await ensurePageHasTitle(driver, EXPECTED_TITLE);
}

async function verifyPageHasToolbar(driver: any): Promise<string> {
    return await searchForElementWithId(driver, TOOLBAR_ID);
}

async function verifyToolbarIsFormattedCorrectly(driver: any): Promise<string> {
    async function findAndValidateButton(name: string): Promise<string> {
        let button;
        try {
            button = await driver.findElement(selenium.By.id(name + "-tab"));
        }
        catch (e: any) {
            if (e.name === "NoSuchElementError")
                return `Unable to find button: ${name}`;
            else
                throw e;
        }
        const buttonText: string = await button.getText();
        if (buttonText.toLowerCase() !== name.toLowerCase())
            return `Expected button to have text ${name} but found ${button.getText()}`;
        else if (!button.isEnabled())
            return `Expected button ${name} to be enabled but was not.`;
        else
            return SUCCESS_MESSAGE;
    }
    let message: string;
    let buttons = ["Move", "Stock", "Flow", "Edit", "Delete"];

    for (const button of buttons) {
        message = await findAndValidateButton(button);
        if (message !== SUCCESS_MESSAGE) return message;
    }
    return SUCCESS_MESSAGE;
}

async function verifyPageHasCanvas(driver: any): Promise<string> {
    return await searchForElementWithId(driver, CANVAS_ID);
}

async function verifyCanvasIsEmpty(driver: any): Promise<string> {
    driver.manage().setTimeouts( { implicit: 500 } );
    return await verifyElementDoesNotExist(
        driver,
        selenium.By.className(STOCK_CLASSNAME),
        "Stock"
    );
}

async function verifyCanvasIsInMoveMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Move");
}

async function clickStockModeButton(driver: any): Promise<string> {
    const stockModeButton = await driver.findElement(selenium.By.id("Stock-tab"));
    if (!stockModeButton) return "Unable to find Create mode button.";
    await stockModeButton.click();
    return SUCCESS_MESSAGE;
}


async function verifyCanvasIsInStockMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Stock");
}

async function createStock(driver: any): Promise<string> {
    const canvas = await driver.findElement(selenium.By.id(CANVAS_ID));
    const message = await clickElementWithOffset(driver, 0, canvas);
    if (message !== SUCCESS_MESSAGE) return message;
    return await searchForElementWithClassName(driver, STOCK_CLASSNAME);
}

async function verifyFirebaseHasOneStock(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== 1)
        return `Expected one stock but found ${myComponents.length}`;
    const myComponent = myComponents[0];
    if (myComponent.getType() !== schema.ComponentType.STOCK)
        return `Expected component to be Stock but was type: ${myComponent.getType()}`

    return SUCCESS_MESSAGE;
}

async function clickMoveModeButton(driver: any): Promise<string> {
    const moveModeButton = await driver.findElement(selenium.By.id("Move-tab"));
    if (!moveModeButton) return "Unable to find Move mode button.";
    await moveModeButton.click();
    return SUCCESS_MESSAGE;
}

async function moveFirstStockOnCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));

    let stock;
    for (var i = 0; i < stocks.length; i++){
        const id = stocks[i].getAttribute("id");
        if (id !== STOCK_COMPONENT_ID && id !== STOCK_COMPONENT2_ID){
            stock = stocks[i];
            break;
        }
    }
    if (!stock) return "Unable to find stock";

    await driver.actions().click(stock).perform();

    return dragElementByOffset(driver,stock, XOFFSET_PX_STOCK1, OFFSET_PX);
}

async function verifyLocationUpdatedInFirebase(driver: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== 5)
        return `Expected five components but found ${myComponents.length}`;

    let myComponent;
    for (var i = 0; i < myComponents.length; i++){
        if (myComponents[i].getType() === schema.ComponentType.STOCK && myComponents[i].getId() !== STOCK_COMPONENT_ID && myComponents[i].getId() !== STOCK_COMPONENT2_ID){
            myComponent = myComponents[i];
            break;
        }
    }

    const myStocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    let myStock
    for (var i = 0; i < myStocks.length; i++){
        const id = await myStocks[i].getAttribute("id");
        if (id !== STOCK_COMPONENT_ID && id !== STOCK_COMPONENT2_ID){
            myStock = myStocks[i];
            break;
        }
    }
    const canvasTop = await myStock.getCssValue("top");
    const canvasLeft = await myStock.getCssValue("left");

    if (!myComponent){
        return "Cannot find the first Stock in the Firebase"; 
    }

    if (myComponent.getData().x !== canvasLeft || myComponent.getData().y !== canvasTop 
        || myComponent.getData().x !== XOFFSET_PX_STOCK1 || myComponent.getData().y !== OFFSET_PX)
        return `Expected stock to have position ${XOFFSET_PX_STOCK1},${OFFSET_PX} ` +
            `but found ${myComponent.getData().x},${myComponent.getData().y} in Firebase and found ${canvasLeft},${canvasTop} in Canvas`;
    return SUCCESS_MESSAGE;
}

async function selectStock(driver: any): Promise<string> {
    let message: string;

    let stock = await getStock(driver);

    message = await checkStockBorderColor(stock, BLACK);
    if (message !== SUCCESS_MESSAGE) return message;
    
    await stock.click();
    stock = await getStock(driver);
    message = await checkStockBorderColor(stock, RED);
    return message;
}

async function addTextToStock(driver: any): Promise<string> {
    let stock = await getStock(driver);
    driver.actions().doubleClick(stock).perform();

    let mui_textfield = await getMuiTextField(driver, schema.ComponentType.STOCK)
    mui_textfield.sendKeys(STOCK_1_TEXT);

    mui_textfield = await getMuiTextField(driver, schema.ComponentType.STOCK)
    const textFieldText = await mui_textfield.getAttribute("value");
    // stock = await getStock(driver);
    if (textFieldText !== STOCK_1_TEXT)
        return `Expected stock to have text "${STOCK_1_TEXT}" but found "${textFieldText}"`
    return SUCCESS_MESSAGE;
}

async function verifyTextUpdatedInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== 1)
        return `Expected one component but found ${myComponents.length}`;
    const myComponent = myComponents[0];
    if (myComponent.getType() !== schema.ComponentType.STOCK)
        return `Expected component to be stock but was ${myComponent.getType()}`;

    const myText = myComponent.getData().text;
    if (myText !== STOCK_1_TEXT)
        return `Expected Firebase stock to have text ${STOCK_1_TEXT} but found: ${myText}`;

    return SUCCESS_MESSAGE;
}

async function createSecondStockInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    const newData = new schema.StockFirebaseComponent(
        STOCK_COMPONENT_ID,
        {
            x: 0,
            y: 0,
            text: MORE_TEXT,
            initvalue: ""
        }
    );
    dm.updateComponent(mySession, newData);
    return SUCCESS_MESSAGE;
}

async function verifySecondStockAppearsOnCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 2)
        return `Expected 2 stocks but found ${stocks.length}`;

    //Prefer this method over for-loop, but this gives the wrong Stock. Need to investigate more
    //const newStock = stocks.find(async (s: any) => await s.getAttribute("id") === COMPONENT_ID);
    let newStock = null;

    for (var i = 0; i < 2; i++) {
        const id = await stocks[i].getAttribute("id")
        if (id === STOCK_COMPONENT_ID){
            newStock = stocks[i];
            break;
        }
    }

    if (!newStock)
        return "Unable to find new stock on canvas";
    const left = await newStock.getCssValue("left");
    const top = await newStock.getCssValue("top");
    if (left !== "0px" || top !== "0px")
        return `Expected new stock at 0px,0px but found at ${left},${top}`;
    return SUCCESS_MESSAGE;
}

async function verifyCorrectStockStillSelected(driver: any): Promise<string> {

    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 2) return `Expected 2 stocks but found ${stocks.length}`;

    // const secondStock = stocks.find( async (s: any) => await s.getAttribute("id") === COMPONENT_ID);
    // const firstStock = stocks.find( async (s: any) => await s.getAttribute("id") !== COMPONENT_ID);
    let firstStock;
    let secondStock;

    for (var i = 0; i < 2; i++) {
        const id = await stocks[i].getAttribute("id")
        if (id !== STOCK_COMPONENT_ID){
            firstStock = stocks[i]
        }
        else if (id === STOCK_COMPONENT_ID){
            secondStock = stocks[i]
        }
    }
    const firstBdColor = await firstStock.getCssValue("border");
    const secondBdColor = await secondStock.getCssValue("border");

    if (!firstBdColor.includes(RED))
        return `First stock: expected red ${RED} border but found ${firstBdColor}`;
    if (!secondBdColor.includes(BLACK))
        return `Second stock: expected black ${BLACK} border but found ${secondBdColor}`;
    return SUCCESS_MESSAGE;
}

async function moveSecondStockInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    const newData = new schema.StockFirebaseComponent(
        STOCK_COMPONENT_ID,
        {
            x: OFFSET_PX,
            y: OFFSET_PX,
            text: MORE_TEXT,
            initvalue: ""
        }
    );
    dm.updateComponent(mySession, newData);

    return SUCCESS_MESSAGE;
}

async function verifySecondStockMovedOnCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 3) return `Expected  stocks but found ${stocks.length}`;
    const secondStock = stocks.find((s: any) => s.getAttribute("id") === STOCK_COMPONENT_ID);
    const left = secondStock.getCssValue("left");
    const top = secondStock.getCssValue("top");
    if (left !== OFFSET_PX || top !== OFFSET_PX)
        return `Expected new stock at ${OFFSET_PX},${OFFSET_PX} but found at ${left},${top}`;
    return SUCCESS_MESSAGE;
}

async function editSecondStockTextInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    const newData = new schema.StockFirebaseComponent(
        STOCK_COMPONENT_ID,
        {
            x: OFFSET_PX,
            y: OFFSET_PX,
            text: STOCK_2_TEXT,
            initvalue: ""
        }
    );
    dm.updateComponent(mySession, newData);

    return SUCCESS_MESSAGE;
}

async function verifyTextChangedOnCanvas(driver: any): Promise<string> {

    const stocks = await driver.findElements(selenium.By.className(STOCK_MUITEXTFIELD_CLASSNAME));
    if (stocks.length !== 2) return `Expected 2 stocks but found ${stocks.length}`;

    let secondStock;
    for (var i = 0; i < 2; i++) {
        const id = await stocks[i].getAttribute("id")
        if (id === STOCK_COMPONENT_ID){
            secondStock = stocks[i];
            break;
        }
    }    
    const text = await secondStock.getAttribute("value");
    if (text !== STOCK_2_TEXT)
        return `Expected text "${STOCK_2_TEXT}" in second stock but found "${text}"`;
    return SUCCESS_MESSAGE;
}

async function clickDeleteModeButton(driver: any): Promise<string> {
    const delModeButton = await driver.findElement(selenium.By.id("Delete-tab"));
    if (!delModeButton) return "Unable to find Delete mode button.";
    await delModeButton.click();
    return SUCCESS_MESSAGE;
}

async function verifyCanvasIsInDeleteMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Delete");
}

async function deleteSecondStockFromFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    dm.removeComponent(mySession, STOCK_COMPONENT_ID);
    return SUCCESS_MESSAGE;
}

async function verifySecondStockDeletedFromCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 2)
        return `Expected 2 stock but found ${stocks.length}`;

    for (var i = 0; i < 2; i ++){
        if (stocks[0].getAttribute("id") === STOCK_COMPONENT_ID)
            return "Expected second stock to be deleted but found it on the canvas";
    }
    return SUCCESS_MESSAGE;
}

async function deleteFirstStock(driver: any): Promise<string> {
    let stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 1)
        return `Expected 1 stock but found ${stocks.length}`;
    await stocks[0].click();
    stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length > 0)
        return `Expected 0 stocks after deleting but found ${stocks.length}`;
    return SUCCESS_MESSAGE;
}

async function verifyFirstStockDeletedFromFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    if (dm.getSessionIds().length !== 1) {
        return `Expected 1 session ID but found ${dm.getSessionIds().length}`
    }
    const stocks = await dm.getComponents(dm.getSessionIds()[0]);
    if (stocks.length > 0)
        return `Expected 0 stocks in Firebase after deleting but found ${stocks.length}`;
    return SUCCESS_MESSAGE;
}

async function clickFlowModeButton(driver: any): Promise<string> {
    const flowModeButton = await driver.findElement(selenium.By.id("Flow-tab"));
    if (!flowModeButton) return "Unable to find Flow mode button.";
    await flowModeButton.click();
    return SUCCESS_MESSAGE;
}

async function verifyCanvasIsInFlowMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Flow");
}

async function createFirstFlow(driver: any): Promise<string> {

    const stocks = await driver.findElements(selenium.By.className(STOCK_MUITEXTFIELD_CLASSNAME));
    if (stocks.length !== 2)
        return `Expected 2 stocks but found ${stocks.length}`;

    let stockS;
    let stockI;

    for (var i = 0; i < 2; i++) {
        const text = await stocks[i].getAttribute("value")
        if (text === STOCK_1_TEXT){
            stockS = stocks[i];
        }
        else if (text === STOCK_2_TEXT){
            stockI = stocks[i]
        }
    }

    await driver.actions().click(stockS).perform();
    driver.manage().setTimeouts( { implicit: 100 } );
    await driver.actions().click(stockI).perform();

    const result = await searchForElementWithClassName(driver, FLOW_SVG_CLASSNAME)
    if (result === SUCCESS_MESSAGE){
        const flow = await driver.findElement(selenium.By.className(FLOW_SECOND_HALF_LINE_CLASSNAME))
        const x2 = await flow.getAttribute("x2")
        const y2 = await flow.getAttribute("y2")

        if (x2 != 70 || y2 != 70){
            return "Flow has wrong direction"
        }
        return SUCCESS_MESSAGE
    }

    return result
    
}

async function verifyFirebaseHasOneFlow(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== 3)
        return `Expected two stocks and one flow (3 components) but found ${myComponents.length}`;

    let flowCount = 0;
    for (var i = 0; i < 3; i++){
        if (myComponents[i].getType() === schema.ComponentType.FLOW)
            flowCount++;
    }
    if (flowCount !== 1) {
        return `Expected one flow but found ${flowCount}`
    }

    return SUCCESS_MESSAGE;
}

async function createThirdStockInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    const newData = new schema.StockFirebaseComponent(
        STOCK_COMPONENT2_ID,
        {
            x: 0,
            y: 0,
            text: STOCK_3_TEXT,
            initvalue: ""
        }
    );
    dm.updateComponent(mySession, newData);
    return SUCCESS_MESSAGE;
}

async function verifyThirdStockAppearsOnCanvas(driver: any): Promise<string> {

    await driver.wait(selenium.until.elementLocated(selenium.By.id(STOCK_COMPONENT2_ID)),100);

    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));

    if (stocks.length !== 3)
        return `Expected 3 stocks but found ${stocks.length}`;

    let newStock = null;

    for (var i = 0; i < 4; i++) {
        const id = await stocks[i].getAttribute("id")
        if (id === STOCK_COMPONENT2_ID){
            newStock = stocks[i];
            break;
        }
    }

    if (!newStock)
        return "Unable to find new stock on canvas";
    const left = await newStock.getCssValue("left");
    const top = await newStock.getCssValue("top");
    if (left !== "0px" || top !== "0px")
        return `Expected new stock at 0px,0px but found at ${left},${top}`;
    return SUCCESS_MESSAGE;
}


  async function createSecondFlowInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    const newData = new schema.FlowFirebaseComponent(
        FLOW_COMPONENT_ID,
        {
            text: "",
            dependsOn: [""],
            equation: "",
            from: STOCK_COMPONENT_ID,
            to: STOCK_COMPONENT2_ID
        }
    );
    dm.updateComponent(mySession, newData);
    return SUCCESS_MESSAGE;
}

async function verifySecondFlowAppearsOnCanvas(driver: any): Promise<string> {
    await driver.wait(selenium.until.elementLocated(selenium.By.id(FLOW_COMPONENT_ID)),100);

    const flows = await driver.findElements(selenium.By.className(FLOW_SVG_CLASSNAME));
    if (flows.length !== 2)
        return `Expected 2 stocks but found ${flows.length}`;


    let newFlow = null;
    for (var i = 0; i < 2; i++) {
        const id = await flows[i].getAttribute("id")
        if (id === FLOW_COMPONENT_ID){
            newFlow = flows[i];
            break;
        }
    }

    if (!newFlow)
        return "Unable to find new Flow on canvas";

    const line = await newFlow.findElement(selenium.By.className(FLOW_SECOND_HALF_LINE_CLASSNAME))
    const x2 = await line.getAttribute("x2")
    const y2 = await line.getAttribute("y2")

    if (x2 != 70 || y2 != 70){
        return "Flow has wrong direction"
    }
    return SUCCESS_MESSAGE
    
}

async function editFirstFlowTextInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];

    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
    return "Unable to find any components for session: " + mySession;
    
    if (myComponents.length !== 5)
    return `Expected three stocks and two flow (5 components) but found ${myComponents.length}`;

    let flow_id;
    let stock_id;
    for (var i = 0; i < 5; i++){
        if ((myComponents[i].getType() === schema.ComponentType.FLOW) && (myComponents[i].getId() !== FLOW_COMPONENT_ID)){
                flow_id = myComponents[i].getId()
        }
        
        else if ((myComponents[i].getType() === schema.ComponentType.STOCK) 
                    && 
                  (myComponents[i].getId() !== STOCK_COMPONENT_ID ) || myComponents[i].getId() !== STOCK_COMPONENT2_ID){

                stock_id = myComponents[i].getId()
        }
    }

    if (!flow_id || !stock_id){
        return "Cannot find the Flow and Stock that were created by Canvas in the Firebase"
    }
    const newData = new schema.FlowFirebaseComponent(
        flow_id,
        {
            text: FLOW_1_TEXT,
            dependsOn: [""],
            equation: "",
            from: stock_id,
            to: STOCK_COMPONENT_ID
        }
    );
    dm.updateComponent(mySession, newData);

    return SUCCESS_MESSAGE;
}

async function verifyFirstFlowTextChangedOnCanvas(driver: any): Promise<string> {

    const flows = await driver.findElements(selenium.By.className(FLOW_MUITEXTFIELD_CLASSNAME));
    if (flows.length !== 2) return `Expected 2 flow but found ${flows.length}`;

    let secondFlow;
    for (var i = 0; i < 2; i++) {
        const id = await flows[i].getAttribute("id")
        if (id !== FLOW_COMPONENT_ID){
            secondFlow = flows[i];
            break;
        }
    }    
    const text = await secondFlow.getAttribute("value");
    if (text !== FLOW_1_TEXT)
        return `Expected text "${FLOW_1_TEXT}" in second stock but found "${text}"`;
    return SUCCESS_MESSAGE;
}

async function addTextToSecondFlow(driver: any): Promise<string> {

    const flows = await driver.findElements(selenium.By.className(FLOW_CLASSNAME));
    let flow;
    for (var i = 0; i < 2; i++){
        if (await flows[i].getAttribute("id") === FLOW_COMPONENT_ID){
            flow = flows[i];
            break;
        }
    }
    let mui_textfield = await getMuiTextField(flow, schema.ComponentType.FLOW)
    mui_textfield.sendKeys(FLOW_2_TEXT);

    mui_textfield = await getMuiTextField(flow, schema.ComponentType.FLOW)
    const textFieldText = await mui_textfield.getAttribute("value");
    
    if (textFieldText !== FLOW_2_TEXT)
        return `Expected flow to have text "${FLOW_2_TEXT}" but found "${textFieldText}"`
    return SUCCESS_MESSAGE;
}

async function verifySecondFlowTextUpdatedInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== 5)
        return `Expected five components but found ${myComponents.length}`;
    
    let myComponent;
    for (var i = 0; i < 5; i ++){
        if (myComponents[i].getType() === schema.ComponentType.FLOW && myComponents[i].getId() === FLOW_COMPONENT_ID){
            myComponent = myComponents[i]
            break
        }        
    }
    if (!myComponent){
        return "Cannot find the second Flow in Firebase"
    }

    const myText = myComponent.getData().text;
    if (myText !== FLOW_2_TEXT)
        return `Expected Firebase flow to have text ${FLOW_2_TEXT} but found: ${myText}`;

    return SUCCESS_MESSAGE;
}

async function clickEditModeButton(driver: any): Promise<string> {
    const flowModeButton = await driver.findElement(selenium.By.id("Edit-tab"));
    if (!flowModeButton) return "Unable to find Flow mode button.";
    await flowModeButton.click();
    return SUCCESS_MESSAGE;
}

async function verifyCanvasIsInEditMode(driver: any): Promise<string> {
    return await verifyCanvasIsInMode(driver, "Edit");
}

async function addInitValueToStocks(driver: any): Promise<string> {

    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));

    for (var i = 0; i < stocks.length; i ++){

        const id = await stocks[i].getAttribute("id");
        await driver.actions().click(stocks[i]).perform();
        let mui_textfield = await getMuiTextField(driver, schema.ComponentType.STOCK, EDITMODE_INITVAL)

        let value;
        if (id === STOCK_COMPONENT_ID)
            value = STOCK_2_INITVAL;
        else if (id  === STOCK_COMPONENT2_ID)
            value = STOCK_3_INITVAL;
        else 
            value = STOCK_1_INITVAL;

        mui_textfield.sendKeys(value.toString());
        mui_textfield = await getMuiTextField(driver, schema.ComponentType.STOCK, EDITMODE_INITVAL)
        const textFieldInitValue = await mui_textfield.getAttribute("value");

        if (textFieldInitValue !== value.toString())
            return `Expected stock to have text "${value.toString()}" but found "${textFieldInitValue}"`;
        const button = await driver.findElement(selenium.By.className(BUTTON_CLASSNAME));
        await driver.actions().click(button).perform();

    }
    return SUCCESS_MESSAGE;
}

async function verifyStocksInitValueUpdatedInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
        return "Unable to find any components for session: " + mySession;
    if (myComponents.length !== 5)
        return `Expected five components but found ${myComponents.length}`;
    
    let myComponentCount = 0
    for (var i = 0; i < 5; i ++){
        if (myComponents[i].getType() === schema.ComponentType.STOCK){
            myComponentCount++;
            const id = await myComponents[i].getId()
            const initvalue = myComponents[i].getData().initvalue;

            if (id === STOCK_COMPONENT_ID){
                if (initvalue !== STOCK_2_INITVAL.toString())
                    return `Expected Firebase Stock to have init value ${STOCK_2_INITVAL} but found: ${initvalue}`;
            }
            else if (id === STOCK_COMPONENT2_ID){
                if (initvalue !== STOCK_3_INITVAL.toString())
                    return `Expected Firebase Stock to have init value ${STOCK_3_INITVAL} but found: ${initvalue}`;     
            }
            else{
                if (initvalue !== STOCK_1_INITVAL.toString())
                    return `Expected Firebase Stock to have init value ${STOCK_1_INITVAL} but found: ${initvalue}`;     
            }
        }        
    }
    
    if (myComponentCount === 0){
        return "Cannot find the Stocks in Firebase"
    }
    return SUCCESS_MESSAGE;
}

async function editFlowEquationsInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];

    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
    return "Unable to find any components for session: " + mySession;
    
    if (myComponents.length !== 5)
    return `Expected three stocks and two flow (5 components) but found ${myComponents.length}`;

    for (var i = 0; i < 5; i++){
        if (myComponents[i].getType() === schema.ComponentType.FLOW){
                let flow = myComponents[i];
                let equation

                if (flow.getId() !== FLOW_COMPONENT_ID)
                    equation = FLOW_1_EQUATION;
                else
                    equation = FLOW_2_EQUATION;
                
                const newData = new schema.FlowFirebaseComponent(
                    flow.getId(),
                    {
                        text: flow.getData().text ,
                        dependsOn: flow.getData().dependsOn,
                        equation: equation,
                        from: flow.getData().from,
                        to: flow.getData().to
                    }
                );
                dm.updateComponent(mySession, newData);
        }
    }

    return SUCCESS_MESSAGE;
}


async function verifyFlowEquationsAppearsOnCanvas(driver: any): Promise<string> {

    const flows = await driver.findElements(selenium.By.className(FLOW_SVG_CLASSNAME));
    

    for (var i = 0; i < flows.length; i ++){

        const id = await flows[i].getAttribute("id");
        await driver.actions().click(flows[i]).perform();

        let value;
        if (id !== FLOW_COMPONENT_ID)
            value = FLOW_1_EQUATION;
        else 
            value = FLOW_2_EQUATION;
        
        let mui_textfield = await getMuiTextField(driver, schema.ComponentType.FLOW, EDITMODE_EQUATION)
        const textFieldEquation = await mui_textfield.getAttribute("value");

        if (textFieldEquation !== value.toString())
            return `Expected flow to have equation "${value.toString()}" but found "${textFieldEquation}"`;
            
        const button = await driver.findElement(selenium.By.className(BUTTON_CLASSNAME));
        await driver.actions().click(button).perform();
    }
    return SUCCESS_MESSAGE;
}

async function moveThirdStockInFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    

    const newData = new schema.StockFirebaseComponent(
        STOCK_COMPONENT2_ID,
        {
            x: XOFFSET_PX_STOCK3,
            y: OFFSET_PX,
            text: STOCK_3_TEXT,
            initvalue: STOCK_3_INITVAL.toString(),
        }
    );
    dm.updateComponent(mySession, newData);

    return SUCCESS_MESSAGE;
}

async function verifyThirdStockMovedOnCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 3) return `Expected  stocks but found ${stocks.length}`;
    const thirdStock = stocks.find((s: any) => s.getAttribute("id") === STOCK_COMPONENT2_ID);
    const left = thirdStock.getCssValue("left");
    const top = thirdStock.getCssValue("top");
    if (left !== XOFFSET_PX_STOCK3 || top !== OFFSET_PX)
        return `Expected new stock at ${XOFFSET_PX_STOCK3},${OFFSET_PX} but found at ${left},${top}`;
    return SUCCESS_MESSAGE;
}



async function deleteFirstFlowFromFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];

    const myComponents = await dm.getComponents(mySession);
    if (!myComponents)
    return "Unable to find any components for session: " + mySession;
    
    if (myComponents.length !== 5)
    return `Expected three stocks and two flow (5 components) but found ${myComponents.length}`;

    let flow
    for (var i = 0; i < 5; i++){
        if (myComponents[i].getType() === schema.ComponentType.FLOW){
                flow = myComponents[i];
                if (flow.getId() !== FLOW_COMPONENT_ID)
                    dm.removeComponent(mySession, flow.getId());
        }
    }

    return SUCCESS_MESSAGE;
}


async function verifyFirstFlowDeletedFromCanvas(driver: any): Promise<string> {
    const flows = await driver.findElements(selenium.By.className(FLOW_CLASSNAME));
    if (flows.length !== 1)
        return `Expected 1 flow but found ${flows.length}`;
    if (await flows[0].getAttribute("id") !== FLOW_COMPONENT_ID)
        return "Expected the first flow to be deleted but found it on the canvas";
    return SUCCESS_MESSAGE;
}

async function deleteSecondFlow(driver: any): Promise<string> {
    let flows = await driver.findElements(selenium.By.className(FLOW_CLASSNAME));
    if (flows.length !== 1)
        return `Expected 1 flow but found ${flows.length}`;
    await flows[0].click();
    flows = await driver.findElements(selenium.By.className(FLOW_CLASSNAME));
    if (flows.length > 0)
        return `Expected 0 stocks after deleting but found ${flows.length}`;
    return SUCCESS_MESSAGE;
}

async function verifySecondFlowDeletedFromFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    if (dm.getSessionIds().length !== 1) {
        return `Expected 1 session ID but found ${dm.getSessionIds().length}`
    }
    const components = await dm.getComponents(dm.getSessionIds()[0]);

    for (var i = 0; i < 3; i ++){
        if (components[i].getType() === schema.ComponentType.FLOW){
            return `Expected 0 flows in Firebase after deleting all but so far found one`;
        }
    }
    return SUCCESS_MESSAGE;
}

async function deleteThirdStockFromFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return `Expected one session but found ${sessions.length}`;
    const mySession = sessions[0];
    dm.removeComponent(mySession, STOCK_COMPONENT2_ID);
    return SUCCESS_MESSAGE;
}

async function verifyThirdStockDeletedFromCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 1)
        return `Expected 1 stock but found ${stocks.length}`;
    if (stocks[0].getAttribute("id") === STOCK_COMPONENT2_ID)
        return "Expected new stock to be deleted but found it on the canvas";
    return SUCCESS_MESSAGE;
}

/*
  This test expects to start logged in on the canvas page, with no stocks.
  This test will leave the Canvas in that same state.
 */



export const canvasPageTestSuite:
    ((driver: any, firebaseDm?: FirebaseInteractions) => Promise<string>)[] =
    [
        verifyPageHasCorrectTitle,
        verifyPageHasToolbar,
        verifyToolbarIsFormattedCorrectly,
        verifyPageHasCanvas,
        verifyCanvasIsEmpty,

        verifyCanvasIsInMoveMode,

        clickStockModeButton,
        verifyCanvasIsInStockMode,

        createStock,
        verifyFirebaseHasOneStock,

        clickMoveModeButton,
        verifyCanvasIsInMoveMode,

        selectStock,
        addTextToStock,
        verifyTextUpdatedInFirebase,

        createSecondStockInFirebase,
        verifySecondStockAppearsOnCanvas,
        verifyCorrectStockStillSelected,
        editSecondStockTextInFirebase,
        verifyTextChangedOnCanvas,

        clickFlowModeButton,
        verifyCanvasIsInFlowMode,
        createFirstFlow,
        verifyFirebaseHasOneFlow,

        createThirdStockInFirebase,
        verifyThirdStockAppearsOnCanvas,

	    createSecondFlowInFirebase,
	    verifySecondFlowAppearsOnCanvas,

	    editFirstFlowTextInFirebase,
	    verifyFirstFlowTextChangedOnCanvas,

        addTextToSecondFlow, 
	    verifySecondFlowTextUpdatedInFirebase,

	    clickEditModeButton,
        verifyCanvasIsInEditMode,

	    addInitValueToStocks,
	    verifyStocksInitValueUpdatedInFirebase,

        editFlowEquationsInFirebase,
        verifyFlowEquationsAppearsOnCanvas,


        // clickMoveModeButton,
        // verifyCanvasIsInMoveMode,

        // moveFirstStockOnCanvas,
        // verifyLocationUpdatedInFirebase,

        // moveSecondStockInFirebase,
        // verifySecondStockMovedOnCanvas,

        // moveThirdStockInFirebase,
	    // verifyThirdStockMovedOnCanvas,

        clickDeleteModeButton,
        verifyCanvasIsInDeleteMode,

        deleteFirstFlowFromFirebase,
        verifyFirstFlowDeletedFromCanvas,

        deleteSecondFlow,
        verifySecondFlowDeletedFromFirebase,


        deleteSecondStockFromFirebase,
        verifySecondStockDeletedFromCanvas,

        deleteThirdStockFromFirebase,
        verifyThirdStockDeletedFromCanvas,

        deleteFirstStock,
        verifyFirstStockDeletedFromFirebase

        //Resources
        // moveSecondStockInFirebase,
        // verifyStockMovedOnCanvas,
        // clickDeleteModeButton,
        // deleteSecondStockFromFirebase,
        // verifySecondStockDeletedFromCanvas,
        // deleteFirstStock,
        // verifyFirstStockDeletedFromFirebase
    ];
