import { initializeApp } from "firebase/app";
import { Database, getDatabase, ref, remove } from "firebase/database";
import firebaseConfig from "../../main/ts/config/firebaseConfig";

const selenium = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome');

const EXPECTED_TITLE = "ModelCollab";
const WEB_ADDRESS = "http://localhost:3000";
const SUCCESS_MESSAGE = "";

async function navigateToWebAddress(driver: any, url: string = WEB_ADDRESS) {
    try {
        await driver.get(url);
        return SUCCESS_MESSAGE;
    }
    catch (e) {
        return `Unable to connect to ${url}. (${e})`;
    }
}

async function ensurePageHasCorrectTitle(driver: any, expectedTitle: string): Promise<string> {
    const title = await driver.getTitle();
    if (title == expectedTitle)
        return SUCCESS_MESSAGE;
    else {
        return `Expected title "${expectedTitle}" but found "${title}"`;
    }
}

async function ensurePageHasToolbar(driver: any): Promise<string> {
    await driver.get(WEB_ADDRESS);
    try {
        await driver.findElement(selenium.By.id("toolbar-box"));
        return SUCCESS_MESSAGE;
    }
    catch (e) {
        return `Toolbar not found. (${e})`;
    }
}

async function testLoginPage(driver: any): Promise<string> {
    async function findAndClickLoginButton(): Promise<string> {
        try {
            loginButton = await driver.findElement(selenium.By.id("login-button"));
        }
        catch (e) {
            return `Login button not found. (${e})`;
        }
        await loginButton.click();

        return SUCCESS_MESSAGE;
    };
    async function switchToLoginWindow(): Promise<string> {
        await driver.wait(
            async () => (await driver.getAllWindowHandles()).length === 2,
            10000
        );
        console.log(await driver.getTitle())
        // const handles = await driver.getAllWindowHandles();
        // if (handles.length !== 2) return "Window not found.";
        // const myWinHandle = driver.getWindowHandle();
        // const loginWinHandle = handles.filter((h: any) => h !== myWinHandle)[0];

        // await driver.switchTo().window(loginWinHandle);


        return SUCCESS_MESSAGE;
    }
    async function login(email: string, password: string): Promise<string> {
        async function enterText(text: string): Promise<string> {
            // let emailInput: any;
            // try {
            //     emailInput = await driver.findElement(driver.By.xpath('//input[@autocomplete="username"]'));
            // }
            // catch (e) {
            //     return `Unable to find ${inputType} input.`;
            //}
            driver.wait(() => false, 10000)
            await driver.switchTo().activeElement().sendKeys(text + '\n');
            return SUCCESS_MESSAGE;
        }

        let message: string;
        message = await enterText(email);
        if (message !== SUCCESS_MESSAGE) return message;
        await enterText(password);
        if (message !== SUCCESS_MESSAGE) return message;
        return SUCCESS_MESSAGE;
    };

    let message: string;
    let loginButton: any;

    message = await navigateToWebAddress(driver);
    if (message !== SUCCESS_MESSAGE) return message;

    message = await ensurePageHasCorrectTitle(driver, EXPECTED_TITLE);
    if (message !== SUCCESS_MESSAGE) return message;

    message = await findAndClickLoginButton();
    if (message !== SUCCESS_MESSAGE) return message;

    console.log(await driver.getTitle())
    message = await switchToLoginWindow();
    if (message !== SUCCESS_MESSAGE) return message;

    console.log(await driver.getTitle())
    message = await login("ericr789@gmail.com", "nK5JW*N!8sFdk4bs");
    if (message !== SUCCESS_MESSAGE) return message;

    return SUCCESS_MESSAGE;
}


async function setupBrowser(driver: any): Promise<void> {
    await driver.manage().deleteAllCookies();
}

async function setupDatabase(database: Database) {
    remove(ref(database, '/'));
}

async function doTests() {
    let message: string;
    const tests: ((driver: any) => Promise<string>)[] = [
        ensurePageHasToolbar
    ];

    const driver = await new selenium.Builder().forBrowser('chrome').build();
    const firebaseApp = initializeApp(firebaseConfig);
    await setupBrowser(driver);


    // Need to log in before we can touch the database
    message = await testLoginPage(driver);
    if (message !== SUCCESS_MESSAGE) {
        throw new Error(message);
    }

    // const database = getDatabase(firebaseApp);
    // setupDatabase(database);

    // for (const func of tests) {
    //     console.log("Running test: " + func.name);
    //     const message = await func(driver);
    //     if (message === SUCCESS_MESSAGE) {
    //         console.log(`  Success!`)
    //     }
    //     else {
    //         console.error(`  Failed: ${message}`);
    //     }
    // }

    driver.quit();
}

doTests();

export { };
