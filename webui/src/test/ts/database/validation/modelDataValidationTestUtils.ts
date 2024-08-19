import mock from "jest-mock-extended/lib/Mock";
import { v4 as uuid } from "uuid";
import ComponentType from "../../../../main/ts/data/components/ComponentType";
import FirebaseCausalLoopLink from "../../../../main/ts/data/components/FirebaseCausalLoopLink";
import FirebaseCausalLoopVertex from "../../../../main/ts/data/components/FirebaseCausalLoopVertex";
import FirebaseComponent, { FirebaseComponentBase } from "../../../../main/ts/data/components/FirebaseComponent";
import FirebaseConnection from "../../../../main/ts/data/components/FirebaseConnection";
import FirebaseDynamicVariable from "../../../../main/ts/data/components/FirebaseDynamicVariable";
import FirebaseFlow from "../../../../main/ts/data/components/FirebaseFlow";
import FirebaseLoopIcon from "../../../../main/ts/data/components/FirebaseLoopIcon";
import FirebaseParameter from "../../../../main/ts/data/components/FirebaseParameter";
import FirebaseStaticModel from "../../../../main/ts/data/components/FirebaseStaticModel";
import FirebaseStickyNote from "../../../../main/ts/data/components/FirebaseStickyNote";
import FirebaseStock from "../../../../main/ts/data/components/FirebaseStock";
import FirebaseSumVariable from "../../../../main/ts/data/components/FirebaseSumVariable";
import { TestCase, UUID_1, NON_STRING_VALUES, INVALID_UUIDS } from "../rtdb.test";

export let stockA = FirebaseStock.createNew(uuid(), 40, 40);
export let stockB = FirebaseStock.createNew(uuid(), 100, 40);
export let flow = FirebaseFlow.createNew(
    uuid(),
    stockA.getId(),
    stockB.getId()
);
export let param = FirebaseParameter.createNew(uuid(), 10, 10);
export let variable = FirebaseDynamicVariable.createNew(uuid(), 0, 0);
export let sumVariable = FirebaseSumVariable.createNew(uuid(), 0, 0);
export let connection = FirebaseConnection.createNew(
    uuid(),
    param.getId(),
    stockA.getId()
);
export let staticModel = new FirebaseStaticModel(
    uuid(),
    { x: 0, y: 0, color: "#000000", modelId: uuid() }
);
export let stickyNote: FirebaseStickyNote = FirebaseStickyNote.createNew(
    uuid(),
    0,
    0
);
export let cldVertexA: FirebaseCausalLoopVertex =
    FirebaseCausalLoopVertex.createNew(uuid(), 0, 0);
export let cldVertexB: FirebaseCausalLoopVertex =
    FirebaseCausalLoopVertex.createNew(uuid(), 0, 0);
export let cldLink: FirebaseCausalLoopLink =
    FirebaseCausalLoopLink.createNew(
        uuid(),
        cldVertexA.getId(),
        cldVertexB.getId()
    );
export let loopIcon: FirebaseLoopIcon =
    FirebaseLoopIcon.createNew(uuid(), 0, 0);

export const ALL_COMPONENTS = [
    stockA,
    stockB,
    flow,
    param,
    variable,
    sumVariable,
    connection,
    staticModel,
    stickyNote,
    cldVertexA,
    cldVertexB,
    cldLink,
    loopIcon
];

export function describeComponentTypeTests(
    successTest: (t: string) => Promise<void>,
    failTest: (t: string) => Promise<void>,
    validComponents: FirebaseComponent[] = ALL_COMPONENTS
): void {
    for (const component of validComponents) {
        test(
            "Component type can be " + component.getType(),
            async () => await successTest(component.getType())
        );
    }


    const invalidComponentTypes: TestCase[] = [
        { label: "uuid", val: UUID_1 },
        { label: "empty string", val: "" },
        { label: "arbitrary string", val: "faketype" },
        { label: "single character", val: "a" },
        { label: "string with special characters", val: "!=&" },
        {
            label: "valid type with extra letters",
            val: param.getType() + "a"
        },
        ...NON_STRING_VALUES
    ];
    for (const { label, val } of invalidComponentTypes) {
        test(
            "Component type cannot be " + label,
            async () => {
                try {
                    await failTest(val as string)
                }
                catch (e) {
                    // Also passes in this case.
                    expect(true).toBe(true);
                }
            }
        );
    }
}

export function describeComponentDataValueTests(
    successTest: (c: FirebaseComponent) => Promise<void>,
    failTest: (c: FirebaseComponent) => Promise<void>
): void {
    for (const component of ALL_COMPONENTS) {
        test(
            `Component data can be valid ` +
            `${component.getType()} data`,
            async () => await successTest(component)
        );
    }

    const invalidComponentData: TestCase[] = [
        { label: "empty string", val: "" },
        { label: "arbitrary string", val: "faketype" },
        ...NON_STRING_VALUES.filter(t => t.label !== "object")
    ];
    for (const { label, val } of invalidComponentData) {
        test(
            "Component data cannot be " + label,
            async () => {
                try {
                    await failTest(
                        makeComponentMock(
                            ComponentType.STOCK,
                            uuid(),
                            val
                        )
                    );
                }
                catch (e) {
                    // Also passes in this case.
                    expect(true).toBe(true);
                }
            }
        );
    }
}

export function describeUUIDTests(
    successTest: (id: any) => Promise<void>,
    failTest: (id: any) => Promise<void>
): void {
    const valid: TestCase[] = [
        { label: "valid UUID", val: UUID_1 }
    ];
    const invalid: TestCase[] = [
        ...INVALID_UUIDS,
        { label: "empty string", val: "" },
        { label: "arbitrary string", val: "arbitrary 123" }
    ];

    for (const { label, val } of valid) {
        test(
            "Component ID can be " + label,
            async () => await successTest(val)
        );
    }
    for (const { label, val } of invalid) {
        test(
            "Component ID cannot be " + label,
            async () => {
                try {
                    await failTest(val);
                }
                catch (e) {
                    // Also passes in this case.
                    expect(true).toBe(true);
                }
            }
        );
    }
}

export function describeChildComponentUUIDTests(
    successTest: (id: any) => Promise<void>,
    failTest: (id: any) => Promise<void>
): void {
    const d = FirebaseStaticModel.ID_DELIMITER;
    test(
        "Can have child component ID",
        async () => await successTest(
            `${uuid()}${d}${uuid()}`
        )
    );
    test(
        "Can have grandchild component ID",
        async () => await successTest(
            `${uuid()}${d}${uuid()}${d}${uuid()}`
        )
    );
    test(
        "Can have great grandchild component ID",
        async () => await successTest(
            `${uuid()}${d}${uuid()}${d}${uuid()}${d}${uuid()}`
        )
    );

    test(
        "Cannot start with delimiter",
        async () => await failTest(
            `${d}${uuid()}${d}${uuid()}`
        )
    );
    test(
        "Cannot end with delimiter",
        async () => await failTest(
            `${uuid()}${d}${uuid()}${d}`
        )
    );
    test(
        "Cannot have grandchild component with invalid UUID",
        async () => await failTest(
            `${uuid()}${d}${UUID_1.slice(1)}${d}${uuid()}`
        )
    );
}

export function describeArbitraryStringTests(
    successTest: (val: any) => Promise<void>,
    failTest: (val: any) => Promise<void>,
    canHaveSpecialCharacters: boolean = true
): void {
    const valid: TestCase[] = [
        { label: "single word string", val: "param" },
        { label: "single letter string", val: "a" },
        { label: "string with spaces", val: "has spaces lol" },
    ];
    if (canHaveSpecialCharacters) {
        valid.push({ label: "string with special characters", val: "#${" },);
    }
    const invalid: TestCase[] = [
        ...NON_STRING_VALUES
    ];

    for (const { label, val } of valid) {
        test(
            "Can be a " + label,
            async () => successTest(val)
        );
    }

    for (const { label, val } of invalid) {
        test(
            "Cannot be a " + label,
            async () => {
                try {
                    await failTest(val);
                }
                catch (e) {
                    // Also passes in this case.
                    expect(true).toBe(true);
                }
            }
        );
    }

}

export function describeComponentDataStructureTests(
    successTest: (c: FirebaseComponent) => Promise<void>,
    failTest: (c: FirebaseComponent) => Promise<void>
): void {
    test(
        "Component data structure can have correct type & data " +
        "fields and nothing else",
        async () => await successTest(stockA)
    );

    test(
        "Component data structure cannot have only 'type'",
        async () => await failTest(
            makeComponentMock(
                ComponentType.STOCK,
                uuid(),
                {
                    "type": ComponentType.STOCK,
                    "data": {}
                }
            )
        )
    );
    test(
        "Component data structure cannot have only 'data'",
        async () => await failTest(
            makeComponentMock(
                ComponentType.STOCK,
                uuid(),
                {
                    "data": stockA.getData()
                }
            )
        )
    );
    test(
        "Component data structure cannot have an extra field",
        async () => await failTest(
            makeComponentMock(
                ComponentType.STOCK,
                uuid(),
                {
                    "type": ComponentType.STOCK,
                    "data": stockA.getData(),
                    "fake": "invalid"
                }
            )
        )
    );
}

export function makeComponentMock(
    cptType: any,
    id: any = uuid(),
    firebaseData: any = { "type": cptType, "data": { a: "a", b: "b" } }
): FirebaseComponent {
    return mock<FirebaseComponentBase<any>>({
        getId: jest.fn().mockImplementation(
            () => id
        ),
        getType: jest.fn().mockImplementation(
            () => cptType
        ),
        toFirebaseEntry: jest.fn().mockImplementation(
            () => [
                id,
                firebaseData
            ]
        ),
        getData: jest.fn().mockImplementation(
            () => firebaseData["data"]
        )
    });
}
