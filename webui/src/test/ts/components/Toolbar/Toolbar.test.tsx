import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReactElement } from "react";
import { AxiosResponse } from "axios";
import Toolbar, { Props } from "../../../../main/ts/components/Toolbar/Toolbar";
import RestClient from "../../../../main/ts/rest/RestClient";
import { UiMode } from "../../../../main/ts/UiMode";
import { act } from "react-dom/test-utils";



const A_SESSION_ID = "0";
const A_MODE: UiMode = UiMode.MOVE;

function makeToolbar(props: Partial<Props>): ReactElement {
    const MOCK_REST_CLIENT: RestClient = {
        getCode: () => { },
        computeModel: () => { },
        getResults: () => { }
    }
    const DEFAULT: Props = {
        mode: A_MODE,
        setMode: () => { },
        returnToSessionSelect: () => { },
        sessionId: A_SESSION_ID,
        restClient: MOCK_REST_CLIENT,
        downloadData: () => { },
        saveModel: () => { },
        importModel: () => { }
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

    describe("Mode buttons", () => {
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
    });

    describe("Other buttons", () => {
        test("'Go Back' button should invoke returnToSessionSelect()", async () => {
            const goBackMock = jest.fn();
            const toolbar: ReactElement = makeToolbar({ returnToSessionSelect: goBackMock });
            render(toolbar);
            fireEvent.click(screen.getByTestId("GoBack"));
            expect(goBackMock).toHaveBeenCalled();
            expect(screen.getByTestId("GoBack")).not.toHaveClass("Mui-selected");
        });

        test("'Get Code' button should invoke the getCode function of restClient", async () => {
            const getCodeMock = jest.fn();
            const sessionId = 'x';
            const restClient: RestClient = {
                getCode: getCodeMock, getResults: () => { }, computeModel: () => { }
            };
            const toolbar: ReactElement = makeToolbar({ restClient, sessionId });
            render(toolbar);
            fireEvent.click(screen.getByTestId("GetCode"));
            expect(getCodeMock).toHaveBeenCalledWith(sessionId, expect.any(Function));
            expect(screen.getByTestId("GetCode")).not.toHaveClass("Mui-selected");
        });
    });

    describe("Compute Model Buttons", () => {

        const clickRunButton = () => {
            let runButton: HTMLElement | undefined;
            waitFor(() => expect(() => runButton = screen.getByText("Run")).not.toThrow());
            expect(runButton).toBeDefined();
            runButton && fireEvent.click(runButton);
        }

        const clickODEButton = () => {
            let menuButtons: HTMLElement[] = screen.getAllByRole("menuitem");
            expect(menuButtons.length).toBeGreaterThan(0);
            fireEvent.click(menuButtons[0]);
        }

        const sendResponseToComputeModelCallback = (response: AxiosResponse) => {
            expect(computeModelMock).toHaveBeenCalled();
            const onResponse = computeModelMock.mock.lastCall[1];
            act(() => onResponse(response));
            jest.advanceTimersByTime(Toolbar.POLLING_TIME_MS);
        }

        const sendResponseToGetResultsCallback = (response: AxiosResponse) => {
            expect(getResultsMock).toHaveBeenCalled();
            const onResponse = getResultsMock.mock.lastCall[1];
            act(() => onResponse(response));
            jest.advanceTimersByTime(Toolbar.POLLING_TIME_MS)
        }

        const expectSpinningWheel = () => {
            expect(() => screen.getByText("Run")).toThrow();
            expect(document.getElementsByClassName("MuiCircularProgress-root").length).toBe(1);
        }

        const expectNoSpinningWheel = () => {
            expect(() => screen.getByText("Run")).not.toThrow();
            expect(document.getElementsByClassName("MuiCircularProgress-root").length).toBe(0);
        }

        let computeModelMock = jest.fn();
        let getResultsMock = jest.fn();
        let downloadDataMock = jest.fn();
        let restClient: RestClient = {
            getResults: getResultsMock,
            computeModel: computeModelMock,
            getCode: () => { }
        };
        const sessionId = "123";

        beforeEach(() => {
            computeModelMock = jest.fn();
            getResultsMock = jest.fn();
            downloadDataMock = jest.fn();
            restClient = { ...restClient, computeModel: computeModelMock, getResults: getResultsMock };
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.runOnlyPendingTimers()
            jest.useRealTimers()
        });

        test("'Run' button should be present as a drop-down menu", async () => {
            const toolbar: ReactElement = makeToolbar({});
            render(toolbar);
            waitFor(() => expect(() => screen.getAllByRole("menuitem")).toThrow());
            clickRunButton()
            waitFor(() => expect(() => screen.getAllByRole("menuitem")).not.toThrow());
        });

        test("'Run' dropdown should include a button which invokes the RestClient", async () => {
            const toolbar = makeToolbar({ restClient: restClient, sessionId });
            render(toolbar);
            clickRunButton();

            const menuItems: HTMLElement[] = screen.getAllByRole("menuitem");
            expect(menuItems.length).toBe(1);
            expect(menuItems[0].textContent?.replaceAll(/\s+/g, '')).toBe("ODE");

            fireEvent.click(menuItems[0]);
            expect(computeModelMock).toHaveBeenCalledTimes(1);
            expect(computeModelMock).toHaveBeenCalledWith(sessionId, expect.anything());
        });

        test("'Run' button should change to spinning wheel if computeModel returns successfully", async () => {
            const toolbar = makeToolbar({ restClient, sessionId });
            render(toolbar);
            clickRunButton();
            clickODEButton();

            const mockResponse = { status: 200, data: "2" } as AxiosResponse;
            sendResponseToComputeModelCallback(mockResponse);
            expectSpinningWheel();
        });

        test("'Run' button should not change to spinning wheel if computeModel returns unsuccessfully", async () => {
            const toolbar = makeToolbar({ restClient, sessionId });
            render(toolbar);
            clickRunButton();
            clickODEButton();

            const mockResponse = { status: 500 } as AxiosResponse;
            sendResponseToComputeModelCallback(mockResponse);
            expectNoSpinningWheel();
        });

        test("Should not invoke getResults if computeModel returns unsuccessfully", async () => {
            const toolbar = makeToolbar({ restClient, sessionId });
            render(toolbar);
            clickRunButton();
            clickODEButton();

            expect(computeModelMock).toHaveBeenCalledTimes(1);
            expect(computeModelMock).toHaveBeenCalledWith(sessionId, expect.anything());

            const mockResponse = { status: 500 } as AxiosResponse;
            sendResponseToComputeModelCallback(mockResponse);
            expect(getResultsMock).not.toHaveBeenCalled();
        });

        test("Should invoke getResults if computeModel returns successfully", async () => {
            const resultId = "231";
            const toolbar = makeToolbar({ restClient, sessionId });
            render(toolbar);
            clickRunButton();
            clickODEButton();


            const mockResponse = { status: 200, data: resultId } as AxiosResponse;
            sendResponseToComputeModelCallback(mockResponse);
            expect(getResultsMock).toHaveBeenCalledTimes(1);
            expect(getResultsMock).toHaveBeenCalledWith(resultId, expect.anything());
        });

        test("Should poll getResults until it returns successfully, then download", async () => {
            const resultId = "231";
            const data = "asdf";
            const toolbar = makeToolbar({ restClient, sessionId, downloadData: downloadDataMock });
            render(toolbar);
            clickRunButton();
            clickODEButton();

            let mockResponse = { status: 200, data: resultId } as AxiosResponse;
            expect(getResultsMock).not.toHaveBeenCalled();
            expect(downloadDataMock).not.toHaveBeenCalled();

            sendResponseToComputeModelCallback(mockResponse);
            expect(getResultsMock).toHaveBeenCalledTimes(1);
            expect(downloadDataMock).not.toHaveBeenCalled();

            mockResponse = { status: 204 } as AxiosResponse;
            sendResponseToGetResultsCallback(mockResponse);
            expect(getResultsMock).toHaveBeenCalledTimes(2);
            expect(downloadDataMock).not.toHaveBeenCalled();

            sendResponseToGetResultsCallback(mockResponse);
            expect(getResultsMock).toHaveBeenCalledTimes(3);
            expect(downloadDataMock).not.toHaveBeenCalled();

            mockResponse = {
                status: 200,
                data,
                headers: {}
            } as AxiosResponse;
            sendResponseToGetResultsCallback(mockResponse);
            expect(getResultsMock).toHaveBeenCalledTimes(3);
            expect(downloadDataMock).toHaveBeenCalledTimes(1);
        });

        test("Spinning wheel should remain if getResults returns unsuccessfully", async () => {
            const toolbar = makeToolbar({ restClient, sessionId, downloadData: downloadDataMock });
            render(toolbar);
            clickRunButton();
            clickODEButton();

            let mockResponse = { status: 200 } as AxiosResponse;
            sendResponseToComputeModelCallback(mockResponse);
            mockResponse = { status: 204 } as AxiosResponse;
            sendResponseToGetResultsCallback(mockResponse);
            expectSpinningWheel();
        });

        test("Spinning wheel should turn back into 'Run' button after getResults returns successfully", async () => {
            const resultId = "231";
            const toolbar = makeToolbar({ restClient, sessionId, downloadData: downloadDataMock });
            render(toolbar);
            clickRunButton();
            clickODEButton();

            let mockResponse = { status: 200, data: resultId } as AxiosResponse;
            sendResponseToComputeModelCallback(mockResponse);
            mockResponse = { status: 200, data: "", headers: {} } as AxiosResponse;
            sendResponseToGetResultsCallback(mockResponse);
            expectNoSpinningWheel();
        });
    });
});
