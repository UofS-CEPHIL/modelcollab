// import { ComponentType, FirebaseDataComponent, StockFirebaseComponent } from "database/build/export";
import {FirebaseComponentModel as schema} from "database/build/export"
// import FirebaseDataModel from "../../main/ts/data/FirebaseDataModel";
// import FirebaseTestingDataModel from "../../main/ts/data/FirebaseTestingDataModel";
import FirebaseInteractions from "./data/FirebaseInteractions";
import { clickElementWithOffset, dragElementByOffset, ensurePageHasTitle, searchForElementWithClassName, searchForElementWithId, selenium, SUCCESS_MESSAGE, verifyElementDoesNotExist } from "./doTests";

const CANVAS_ID = "canvas-div";
const TOOLBAR_ID = "toolbar-box";
const STOCK_CLASSNAME = "stock-div";
const COMPONENT_ID = "999";
const OFFSET_PX = 250;
const EXPECTED_TITLE = "ModelCollab";
const SOME_TEXT = "text";
const MORE_TEXT = "moretext";
const EVEN_MORE_TEXT = "asdfasd";

const getStock = async (driver: any) =>
    await driver.findElement(selenium.By.className(STOCK_CLASSNAME));

async function getSelectedToolbarTabId(driver: any): Promise<string | null> {
    try {
        const selectedTab = await driver.findElement(selenium.By.className("Mui-selected"));
        return selectedTab.getAttribute("id");
    }
    catch (e) {
        return null;
    }
}

function checkStockBackgroundColor(stock: any, expectedColour: string) {
    if (!stock) return "Unable to find stock.";
    const colour = stock.getCssValue("background");
    if (colour.toLowerCase() !== expectedColour)
        return "Expected selected stock to be ${expectedColour} but found: ${colour}";
    return SUCCESS_MESSAGE;
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
    const moveModeButton = await driver.findElement(selenium.By.id("move-tab"));
    if (!moveModeButton) return "Unable to find Move mode button.";
    await moveModeButton.click();
    return SUCCESS_MESSAGE;
}

async function moveStock(driver: any): Promise<string> {
    const stock = await driver.findElement(selenium.By.className(STOCK_CLASSNAME));
    if (!stock) return "Unable to find stock";
    return dragElementByOffset(driver, OFFSET_PX, stock);
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
    if (myComponents.length !== 1)
        return `Expected one stock but found ${myComponents.length}`;
    const myComponent = myComponents[0];

    const myStock = await getStock(driver);
    const canvasTop = myStock.getCssValue("left");
    const canvasLeft = myStock.getCssValue("top");

    if (myComponent.getData().x !== canvasLeft || myComponent.getData().y !== canvasTop)
        return `Expected stock to have position ${canvasLeft},${canvasTop} ` +
            `but found ${myComponent.getData().x},${myComponent.getData().y}`;
    return SUCCESS_MESSAGE;
}

async function selectStock(driver: any): Promise<string> {
    let message: string;

    let stock = await getStock(driver);
    message = checkStockBackgroundColor(stock, "blue");
    if (message !== SUCCESS_MESSAGE) return message;
    await stock.click();
    stock = await getStock(driver);
    message = checkStockBackgroundColor(stock, "red");
    return message;
}

async function addTextToStock(driver: any): Promise<string> {
    let stock = await getStock(driver);
    driver.actions().doubleClick(stock).perform();
    driver.sendKeys(SOME_TEXT);
    stock = await getStock(driver);
    if (stock.getText() !== SOME_TEXT)
        return `Expected stock to have text ${SOME_TEXT} but found ${stock.getText()}`
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
    if (myText !== SOME_TEXT)
        return `Expected Firebase stock to have text ${SOME_TEXT} but found: ${myText}`;

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
        COMPONENT_ID,
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

async function verifyStockAppearsOnCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 2)
        return `Expected 2 stocks but found ${stocks.length}`;
    const newStock = stocks.find((s: any) => s.getAttribute("id") === COMPONENT_ID);
    if (!newStock)
        return "Unable to find new stock on canvas";
    const left = newStock.getCssValue("left");
    const top = newStock.getCssValue("top");
    if (left != 0 || top != 0)
        return `Expected new stock at 0,0 but found at ${left},${top}`;
    return SUCCESS_MESSAGE;
}

async function verifyCorrectStockStillSelected(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 2) return `Expected 2 stocks but found ${stocks.length}`;
    const secondStock = stocks.find((s: any) => s.getAttribute("id") === COMPONENT_ID);
    const firstStock = stocks.find((s: any) => s.getAttribute("id") !== COMPONENT_ID);
    const firstBgColor = firstStock.getCssValue("background");
    const secondBgColor = secondStock.getCssValue("background");
    if (firstBgColor !== "red")
        return `First stock: expected red background but found ${firstBgColor}`;
    if (secondBgColor !== "blue")
        return `Second stock: expected blue background but found ${secondBgColor}`;
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
        COMPONENT_ID,
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

async function verifyStockMovedOnCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 2) return `Expected 2 stocks but found ${stocks.length}`;
    const secondStock = stocks.find((s: any) => s.getAttribute("id") === COMPONENT_ID);
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
        COMPONENT_ID,
        {
            x: OFFSET_PX,
            y: OFFSET_PX,
            text: EVEN_MORE_TEXT,
            initvalue: ""
        }
    );
    dm.updateComponent(mySession, newData);

    return SUCCESS_MESSAGE;
}

async function verifyTextChangedOnCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 2) return `Expected 2 stocks but found ${stocks.length}`;
    const secondStock = stocks.find((s: any) => s.getAttribute("id") === COMPONENT_ID);
    const text = secondStock.getText();
    if (text !== EVEN_MORE_TEXT)
        return `Expected text "${EVEN_MORE_TEXT}" in second stock but found "${text}"`;
    return SUCCESS_MESSAGE;
}

async function clickDeleteModeButton(driver: any): Promise<string> {
    const delModeButton = await driver.findElement(selenium.By.id("delete-tab"));
    if (!delModeButton) return "Unable to find Delete mode button.";
    await delModeButton.click();
    return SUCCESS_MESSAGE;
}

async function deleteSecondStockFromFirebase(_: any, dm?: FirebaseInteractions): Promise<string> {
    if (!dm)
        return "Expected a firebase DM but found none";
    const sessions = dm.getSessionIds();
    if (sessions.length !== 1)
        return "Expected one session but found ${sessions.length}";
    const mySession = sessions[0];
    dm.removeComponent(mySession, COMPONENT_ID);
    return SUCCESS_MESSAGE;
}

async function verifySecondStockDeletedFromCanvas(driver: any): Promise<string> {
    const stocks = await driver.findElements(selenium.By.className(STOCK_CLASSNAME));
    if (stocks.length !== 1)
        return `Expected 1 stock but found ${stocks.length}`;
    if (stocks[0].getAttribute("id") === COMPONENT_ID)
        return "Expected new stock to be deleted but found it on the canvas";
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

        //Resources
        // moveStock,
        // verifyLocationUpdatedInFirebase,

        createSecondStockInFirebase,
        verifyStockAppearsOnCanvas,
        verifyCorrectStockStillSelected,
        editSecondStockTextInFirebase,
        verifyTextChangedOnCanvas,

        //TODO
        //end TODO

        moveSecondStockInFirebase,
        verifyStockMovedOnCanvas,
        clickDeleteModeButton,
        deleteSecondStockFromFirebase,
        verifySecondStockDeletedFromCanvas,
        deleteFirstStock,
        verifyFirstStockDeletedFromFirebase
    ];
