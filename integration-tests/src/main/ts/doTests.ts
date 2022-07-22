import { loginPageTestSuite } from "./loginPage";
import { canvasPageTestSuite } from "./canvasPage";
import FirebaseInteractions from "./data/FirebaseInteractions"
require('chromedriver');
export const selenium = require("selenium-webdriver");
export const WEB_ADDRESS = "http://localhost:3000";
export const SUCCESS_MESSAGE = "";
export const DEFAULT_WAIT_TIME_MS = 1000;
export async function navigateToWebAddress(
    driver: any,
    url: string
): Promise<string> {
    try {
        await driver.get(url);
        return SUCCESS_MESSAGE;
    }
    catch (e) {
        return `Unable to connect to ${url}. (${e})`;
    }
}

export async function ensurePageHasTitle(
    driver: any,
    expectedTitle: string
): Promise<string> {

    const result: boolean = await driver.wait(
        selenium.until.titleIs(expectedTitle),
        DEFAULT_WAIT_TIME_MS
    );
    if (result)
        return SUCCESS_MESSAGE;
    else {
        return `Expected title "${expectedTitle}" but found "${await driver.getTitle()}"`;
    }
}

export async function searchForElementWithLocator(
    driver: any,
    locator: any,
    elemType: string
): Promise<string> {

    const result: boolean = await driver.wait(
        selenium.until.elementLocated(
            locator
        ),
        DEFAULT_WAIT_TIME_MS
    );
    if (result) {
        return SUCCESS_MESSAGE;
    }
    else {
        return `${elemType} not found.`;
    }
}

export async function searchForElementWithId(
    driver: any,
    id: string
): Promise<string> {
    return await searchForElementWithLocator(driver, selenium.By.id(id), id);
}

export async function searchForElementWithClassName(
    driver: any,
    name: string
): Promise<string> {
    return await searchForElementWithLocator(driver, selenium.By.className(name), name);
}

export async function clickElementWithOffset(
    driver: any,
    offset: number,
    elem: any
): Promise<string> {

    try {
        const actions = driver.actions();
        await actions
            .move({ x: offset, y: offset, origin: elem })
            .click()
            .perform();
    }
    catch (e) {
        return `Error clicking element: ${e}`;
    }
    return SUCCESS_MESSAGE;
}

export async function dragElementByOffset(
    driver: any,
    offset: number,
    elem: any
): Promise<string> {
    try {
        await driver.actions().dragAndDropBy(elem, offset, offset);
    }
    catch (e) {
        return `Error dragging element: ${e}`;
    }
    return SUCCESS_MESSAGE;
}

export async function verifyElementDoesNotExist(
    driver: any,
    locator: any,
    elemName: string
): Promise<string> {
    let element;
    try {
        element = await driver.findElement(locator);
    }
    catch (e: any) {
        if (e.name == "NoSuchElementError")
            return SUCCESS_MESSAGE;
        else
            throw e;
    }
    if (!element) return `Unable to find element ${elemName}`
    const result: boolean = await driver.wait(
        selenium.until.elementIsNotVisible(
            element
        ),
        DEFAULT_WAIT_TIME_MS
    );
    if (result) return SUCCESS_MESSAGE;
    else return "Element ${elemName} expected to disappear but still visible";
}


async function setupBrowser(driver: any): Promise<void> {
    await driver.manage().deleteAllCookies();
}

async function setupFirebase(mgr: FirebaseInteractions): Promise<void> {
    mgr.login();
}

async function doTests() {

    const tests: ((driver: any, fbDm?: FirebaseInteractions) => Promise<string>)[] = [
        ...loginPageTestSuite,
        ...canvasPageTestSuite
    ];

    const driver = await new selenium.Builder().forBrowser('chrome').build();
    const firebaseManager = await FirebaseInteractions.create();
    await setupFirebase(firebaseManager);
    // const firebaseDataModel = new FirebaseTestingDataModelImpl(firebaseManager, driver);
    await setupBrowser(driver);
    let message: string;

    setTimeout(() => {
        const sessions = firebaseManager.getSessionIds();
        console.log(sessions);
        firebaseManager.getComponents(sessions[0]).then(c => console.log(c));
    }, 1000);

    for (const test of tests) {
        console.log("Running test: " + test.name);
        try {
            message = await test(driver, firebaseManager);
        }
        catch (e) {
            message = `Uncaught exception: ${e}`;
        }
        if (message === SUCCESS_MESSAGE) {
            console.log(`Success!`)
        }
        else {
            console.error(`Failed: ${message}`);
            break;
        }
    }
    console.log("Done.")
    driver.quit();
}

doTests();

export { };
