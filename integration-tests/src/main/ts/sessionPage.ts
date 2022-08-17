import {
    ensurePageHasTitle,
    selenium,
    SUCCESS_MESSAGE,
    verifyElementDoesNotExist,
    searchForElementWithClassName,
    searchForElementWithId,
    WEB_ADDRESS
} from "./doTests";

const EXPECTED_TITLE = "ModelCollab";
const SESSION_CLASSNAME = "MuiListItemButton-root MuiListItemButton-gutters MuiButtonBase-root css-16ac5r2-MuiButtonBase-root-MuiListItemButton-root";
const SESSION_SUBCLASSNAME = "MuiTypography-root MuiTypography-body1 MuiListItemText-primary css-10hburv-MuiTypography-root"
const SESSION_INPUT = "MuiOutlinedInput-input MuiInputBase-input css-1t8l2tu-MuiInputBase-input-MuiOutlinedInput-input"

async function ensurePageHasCorrectTitle(driver: any): Promise<string> {
    return await ensurePageHasTitle(driver, EXPECTED_TITLE);
}

async function verifyPageHasSessionInput(driver: any): Promise<string> {
    return await searchForElementWithClassName(driver, SESSION_INPUT);
}

async function verifyPageHasSession(driver: any): Promise<string> {
    return await searchForElementWithClassName(driver, SESSION_CLASSNAME);

}


async function findAndClickTestSessionButton(driver: any): Promise<string> {
    let testSession: any;
    let sessions: any;
    try {
        sessions = await driver.findElements(selenium.By.className(SESSION_CLASSNAME));
    }
    catch (e) {
        return `Test session not found. (${e})`;
    }
    try {
        for (var i = 0; i < sessions.length; i ++){
            testSession = await sessions[i].findElement(selenium.By.className(SESSION_SUBCLASSNAME));
            if (await testSession.getText() === "test"){
                await testSession.click();
            }
        }
        
    }
    catch (e) {
        return `Error clicking test session: (${e})`;
    }
    return SUCCESS_MESSAGE;
}

async function waitForSessionPageToDisappear(driver: any): Promise<string> {
    return await verifyElementDoesNotExist(
        driver,
        selenium.By.className(SESSION_CLASSNAME),
        "test"
    );
}


// This test suite should start from a clean browser with no cookies,
// will navigate to the site, and end just after successfully logging
// in
export const sessionPageTestSuite = [
    ensurePageHasCorrectTitle,
    verifyPageHasSessionInput,
    verifyPageHasSession,
    findAndClickTestSessionButton,    
    waitForSessionPageToDisappear
    // Shouldn't need to actually log in because we should already be
    // authenticated in the local firebase emulators while running
    // these tests.
];
