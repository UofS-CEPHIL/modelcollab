import {
    ensurePageHasTitle,
    navigateToWebAddress,
    selenium,
    SUCCESS_MESSAGE,
    verifyElementDoesNotExist,
    WEB_ADDRESS
} from "./doTests";

const EXPECTED_TITLE = "ModelCollab";

async function goToModelCollabWebsite(driver: any): Promise<string> {
    return await navigateToWebAddress(driver, WEB_ADDRESS);
}

async function ensurePageHasCorrectTitle(driver: any): Promise<string> {
    return await ensurePageHasTitle(driver, EXPECTED_TITLE);
}

async function findAndClickLoginButton(driver: any): Promise<string> {
    let loginButton: any;
    try {
        loginButton = await driver.findElement(selenium.By.id("login-button"));
    }
    catch (e) {
        return `Login button not found. (${e})`;
    }
    try {
        await loginButton.click();
    }
    catch (e) {
        return `Error clicking login button: (${e})`;
    }
    return SUCCESS_MESSAGE;
}

async function waitForLoginPageToDisappear(driver: any): Promise<string> {
    return await verifyElementDoesNotExist(
        driver,
        selenium.By.id("login-button"),
        "Login Button"
    );
}


// This test suite should start from a clean browser with no cookies,
// will navigate to the site, and end just after successfully logging
// in
export const loginPageTestSuite = [
    goToModelCollabWebsite,
    ensurePageHasCorrectTitle,
    findAndClickLoginButton,
    waitForLoginPageToDisappear
    // Shouldn't need to actually log in because we should already be
    // authenticated in the local firebase emulators while running
    // these tests.
];
