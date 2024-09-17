import fs from "fs";
import { v4 as uuid } from "uuid";
import { initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import FirebaseParameter from "../../../main/ts/data/components/FirebaseParameter";
import FirebaseStock from "../../../main/ts/data/components/FirebaseStock";
import FirebaseScenario from "../../../main/ts/data/components/FirebaseScenario";
import describeUserValidationRulesTests from "./validation/userValidationRulesTests";
import describePermissionsValidationsTests from "./validation/permissionsValidationTests";
import describeModelMetadataValidationTests from "./validation/modelMetadataValidationTests";
import describeModelDataValidationTests from "./validation/modelDataValidationTests";
import { Bytes } from "firebase/firestore";
import describeDegenerateRulesTests from "./rules/rtdbDegenerateRulesTests";
import describeUserDataRulesTests from "./rules/rtdbUserDataRulesTest";
import describeModelPermissionsRulesTests from "./rules/rtdbModelPermissionsRulesTests";
import describeModelMetadataRulesTests from "./rules/rtdbModelMetadataRulesTest";
import describeModelDataRulesTests from "./rules/rtdbModelDataRulesTests";

export type Database = firebase.default.database.Database;
export type EmptyFunction = jest.EmptyFunction;
export type TestCase = { label: string, val: unknown };

export const UUID_1 = "3ebf0422-3421-4faa-8a34-8039f097092f";
export const INVALID_UUIDS = [
    {
        label: "uuid with invalid letter",
        val: "ceaf6zd9-fff0-478a-9be9-8810dfd9109d"
    },
    {
        label: "uuid with invalid character",
        val: "ce+f62d9-fff0-478a-9be9-8810dfd9109d"
    },
    {
        label: "uuid without dashes",
        val: "ceaf6zd9fff0478a9be98810dfd9109d"
    },
    {
        label: "uuid with invalid format",
        val: "ce1f62-fddff0-478a-9be9-8810dfd9109d"
    }
];

export const NON_STRING_VALUES: TestCase[] = [
    { label: "boolean", val: false },
    { label: "float", val: 1.23 },
    { label: "int", val: 1.0 },
    { label: "array", val: ["a", "b"] },
    { label: "bytes", val: Bytes.fromBase64String("asdfadsf") },
    { label: "object", val: { a: "a", b: "b" } },
];

export const UID_UNAUTHENTICATED = "unauthenticated";
export const UID_1 = "8lJpOxMiWwhO0h1hkfnpoUjZCTnt";
export const NAME_1 = "Cletus Jones";
export const EMAIL_1 = "yee.haw@texas.gov";
export const UID_2 = "zdlk2R35KC0WlSBvjqWroHtUYgoq";
export const NAME_2 = "Jerry Davis";
export const EMAIL_2 = "jd-coolguy@hotmail.com";
export const UID_3 = "abck2R30KC0WlBBvjqWroHtUYoob";
export const NAME_3 = "Sally Harris";
export const EMAIL_3 = "test123@example.com";

export const INVALID_UIDS: TestCase[] = [
    {
        label: "uid with invalid character",
        val: "$" + UID_1.slice(1)
    },
    { label: "uid with extra character", val: UID_1 + "2" },
    { label: "uid with missing character", val: UID_1.slice(1) },
];

export const MODELID_1 = uuid();
export const MODELNAME_1 = "model1";
export const MODELID_2 = uuid();
export const MODELNAME_2 = "model_2";

export const PARAM_1 = new FirebaseParameter(
    uuid(),
    {
        ...FirebaseParameter.createNew("0", 0, 0).getData(),
        text: "P1",
        value: "100.0",
    }
);
export const STOCK_1 = new FirebaseStock(
    uuid(),
    {
        ...FirebaseStock.createNew("0", 0, 0).getData(),
        text: "S1",
        value: `${PARAM_1.getData().text}`
    }
);

export const COMPONENT_1 = PARAM_1;
export const COMPONENT_2 = STOCK_1;
export const SUB_REPLACED_ID = uuid();
export const SUB_REPLACEMENT_ID = uuid();
export const SCENARIO = new FirebaseScenario(
    uuid(),
    {
        startTime: "0.0",
        stopTime: "123.321",
        name: "A Test Scenario",
        overrides: { [`${COMPONENT_1.getData().text}`]: "-0.01" }
    }
);
export const STATIC_MODEL_ID = uuid();

export var env: RulesTestEnvironment | null = null;
export var unauthenticated: Database | null = null;
export var user1: Database | null = null;
export var user2: Database | null = null;
export var user3: Database | null = null;

export function getDb(uid: string): Database {
    let db: Database | null = null;
    switch (uid) {
        case UID_UNAUTHENTICATED:
            db = unauthenticated;
            break;
        case UID_1:
            db = user1;
            break;
        case UID_2:
            db = user2;
            break;
        case UID_3:
            db = user3;
            break;
        default:
            break;
    }
    if (!db) throw new Error("Can't find user: " + uid);
    else return db;
}

describe("Database", () => {

    const rules = fs.readFileSync("../database/database.rules.json", "utf-8");

    beforeAll(async () => {
        env = await initializeTestEnvironment({
            projectId: "modelcollab",
            database: {
                host: "127.0.0.1",
                port: 9000,
                rules
            }
        });
        unauthenticated = env.unauthenticatedContext().database();
        user1 = env.authenticatedContext(UID_1).database();
        user2 = env.authenticatedContext(UID_2).database();
        user3 = env.authenticatedContext(UID_3).database();
    });

    afterAll(async () => await env?.cleanup());

    beforeEach(async () => await env!.clearDatabase());

    describe("Security Rules", () => {
        describeDegenerateRulesTests();
        describeUserDataRulesTests();
        describeModelPermissionsRulesTests();
        describeModelMetadataRulesTests();
        describeModelDataRulesTests();
    });

    describe("Validation Rules", () => {
        describeUserValidationRulesTests();
        describePermissionsValidationsTests();
        describeModelMetadataValidationTests();
        describeModelDataValidationTests();
    });
});
