import { fireEvent, screen, waitFor, waitForElementToBeRemoved } from "@testing-library/react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react-dom/test-utils";
import SessionSelectScreen from "../../../../main/ts/components/screens/SessionSelectScreen";
import FirebaseDataModel from "../../../../main/ts/data/FirebaseDataModel";
import MockFirebaseDataModel from "../../data/MockFirebaseDataModel";

/*
  This needs to be done in order to make tests with Konva behave
  properly
 */
declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;



export default class SessionSelectScreenTest {

    private firebaseDataModel: FirebaseDataModel;
    private openSession: (s: string) => void;
    protected containerNode: HTMLElement | null = null;
    protected root: Root | null = null;

    public constructor() {
        this.firebaseDataModel = new MockFirebaseDataModel();
        this.openSession = jest.fn();
    }

    public describeTests(): void {
        describe("<SessionSelectScreen />", () => {

            const renderScreen = () => {
                act(() => this.root?.render(
                    <SessionSelectScreen
                        firebaseData={this.firebaseDataModel}
                        openSession={this.openSession}
                    />
                ));
            }

            const expectNItemsInList = async (n: number) => {
                await waitFor(() =>
                    expect(screen.getByTestId("sessionsList").childElementCount).toBe(n + 1)
                );
            }

            beforeEach(() => {
                this.firebaseDataModel = new MockFirebaseDataModel();
                this.openSession = jest.fn();
                this.containerNode = document.createElement("div");
                document.body.appendChild(this.containerNode);
                this.root = createRoot(this.containerNode);
                renderScreen();
            });

            describe("With empty list", () => {
                test("Should not render any list items", async () => {
                    expectNItemsInList(0);
                });

                const newSessionId = "newSessionId";

                const addNewListItem = (id: string) => {
                    const textBoxes = screen.getAllByRole("textbox");
                    const submitButtons = screen.getAllByRole("button");


                    textBoxes.forEach(b =>
                        act(() => { fireEvent.change(b, { target: { value: id } }) })
                    );
                    submitButtons.forEach(b =>
                        act(() => { fireEvent.click(b) })
                    );
                }

                test("Should render new list item when added locally", async () => {
                    addNewListItem(newSessionId);
                    expectNItemsInList(1);
                    const foundButtons = screen.getAllByText(newSessionId);
                    expect(foundButtons.length).toBeGreaterThanOrEqual(1);
                    foundButtons.forEach(b => act(() => { fireEvent.click(b) }));
                    expect(this.openSession).toHaveBeenCalledWith(newSessionId);
                });

                test("Should notify Firebase when list item added locally", async () => {
                    addNewListItem(newSessionId);
                    expect(this.firebaseDataModel.addSession).toHaveBeenCalledWith(newSessionId);
                });
            });

            describe("With items in list", () => {

                const dummySessionsList = ["fdsafwatysaf", "s1", "asdf", "123", "!!!with$ymb 0l$"];

                const callSessionsCallback = (sessions: string[]) => {
                    const sessionsCallback =
                        (this.firebaseDataModel.subscribeToSessionList as jest.Mock)
                            .mock.lastCall[0] as (s: string[]) => void;
                    act(() => sessionsCallback(sessions));
                }

                beforeEach(() => {
                    callSessionsCallback(dummySessionsList);
                });

                test(
                    "Should display all items from Firebase list",
                    async () => {
                        expectNItemsInList(dummySessionsList.length);
                        dummySessionsList.forEach(s => {
                            expect(() => screen.getByText(s)).not.toThrow();
                        });
                    }
                );

                dummySessionsList.forEach(s => {
                    test(`Should invoke openSession when ${s} button clicked`, async () => {
                        const buttons = screen.getAllByText(s);
                        act(() => buttons.forEach(b => fireEvent.click(b)));
                        expect(this.openSession).toHaveBeenCalledTimes(1);
                        expect(this.openSession).toHaveBeenCalledWith(s);
                    });
                });

                test("Should add item when added from Firebase", async () => {
                    const newSessionLabel = "newsession";
                    const newSessionsList = [...dummySessionsList, newSessionLabel];
                    act(() => callSessionsCallback(newSessionsList));

                    newSessionsList.forEach(s => {
                        expect(() => screen.getAllByText(s)).not.toThrow();
                    });
                });

                test("Should remove item when removed from Firebase", async () => {
                    const removedSession = dummySessionsList[0];
                    const newSessionsList = dummySessionsList.slice(1);
                    act(() => callSessionsCallback(newSessionsList));

                    waitForElementToBeRemoved(() => screen.getAllByText(removedSession));
                    newSessionsList.forEach(s => {
                        expect(() => screen.getAllByText(s)).not.toThrow();
                    });
                    expectNItemsInList(newSessionsList.length);
                });

                test("Should disallow duplicate names", async () => {
                    const duplicateName = dummySessionsList[1];
                    const textBoxes = screen.getAllByRole("textbox");
                    textBoxes.forEach(b =>
                        act(() => { fireEvent.change(b, { target: { value: duplicateName } }) })
                    );
                    const buttons = screen.getAllByRole("button");
                    const nonSessionButtons = buttons
                        .filter(b => dummySessionsList.find(s => b.innerHTML.includes(s)));
                    expect(nonSessionButtons.length).toBeGreaterThanOrEqual(1);
                    nonSessionButtons.forEach(b => act(() => { fireEvent.click(b) }));
                    expect(this.firebaseDataModel.addSession).not.toHaveBeenCalled();
                    expectNItemsInList(dummySessionsList.length);
                });
            });
        });
    }
}

new SessionSelectScreenTest().describeTests();
