import { fireEvent, render, screen } from "@testing-library/react";
import { ReactElement } from "react";
import Toolbar, { Props } from "../../../main/ts/components/Toolbar/Toolbar";
import RestClient from "../../../main/ts/rest/RestClient";
import { UiMode } from "../../../main/ts/UiMode";

const A_SESSION_ID = "0";
const A_MODE: UiMode = UiMode.MOVE;

function makeToolbar(props: Partial<Props>): ReactElement {
    const MOCK_REST_CLIENT: RestClient = { getCode: () => { } }
    const DEFAULT: Props = {
        mode: A_MODE,
        setMode: () => { },
        returnToSessionSelect: () => { },
        sessionId: A_SESSION_ID,
        restClient: MOCK_REST_CLIENT
    };
    return (
        <Toolbar {...DEFAULT} {...props} />
    );
}

function getAllButtonTestIds(): string[] {
    return (Object.values(UiMode) as string[])
        .concat(["GetCode", "GoBack"]);
}

describe("<Toolbar />", () => {

    async function testClickModeInvokesFunction(mode: UiMode): Promise<void> {
        const setModeMock = jest.fn();
        const toolbar: ReactElement = makeToolbar({ setMode: setModeMock });
        render(toolbar);
        fireEvent.click(screen.getByTestId(mode));
        expect(setModeMock).toHaveBeenCalledWith(mode);
    }

    async function testCorrectButtonIsSelected(mode: UiMode): Promise<void> {
        const toolbar: ReactElement = makeToolbar({ mode });
        render(toolbar);
        expect(screen.getByTestId(mode)).toHaveClass("Mui-selected");
        getAllButtonTestIds()
            .filter(s => s !== mode.toString())
            .forEach(
                s => expect(screen.getByTestId(s)).not.toHaveClass("Mui-selected")
            );
    }

    Object.values(UiMode).forEach(m => {
        test(
            `Clicking '${m}' button should invoke setMode with mode ${m}`,
            async () => await testClickModeInvokesFunction(m)
        );
        test(
            `Toolbar with mode ${m} should have '${m}' button marked as selected`,
            async () => await testCorrectButtonIsSelected(m)
        );
    });

    test("'Get Code' button should invoke the getCode function of restClient", async () => {
        const getCodeMock = jest.fn();
        const sessionId = 'x';
        const restClient: RestClient = { getCode: getCodeMock };
        const toolbar: ReactElement = makeToolbar({ restClient, sessionId });
        render(toolbar);
        fireEvent.click(screen.getByTestId("GetCode"));
        expect(getCodeMock).toHaveBeenCalledWith(sessionId, expect.any(Function));
        expect(screen.getByTestId("GetCode")).not.toHaveClass("Mui-selected");
    });

    test("'Go Back' button should invoke returnToSessionSelect()", async () => {
        const goBackMock = jest.fn();
        const toolbar: ReactElement = makeToolbar({ returnToSessionSelect: goBackMock });
        render(toolbar);
        fireEvent.click(screen.getByTestId("GoBack"));
        expect(goBackMock).toHaveBeenCalled();
        expect(screen.getByTestId("GoBack")).not.toHaveClass("Mui-selected");
    });

});
