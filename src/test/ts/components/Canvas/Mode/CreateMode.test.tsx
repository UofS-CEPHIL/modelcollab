import { render, fireEvent } from "@testing-library/react";
import CreateMode, { Props } from "../../../../../main/ts/components/Canvas/Mode/CreateMode";
import FirebaseDataModel from '../../../../../main/ts/data/FirebaseDataModel';
import { DataContainer } from '../../../../../main/ts/data/DataContainer';

const TEST_SESSION_ID: string = "0";

function renderCreateMode(props: Partial<Props> = {}) {
    const defaultProps: Props = {
        data: new DataContainer(),
        sessionId: TEST_SESSION_ID,
        firebaseDataModel: {
            updateComponent: () => { },
            subscribeToComponent: () => { },
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        }
    };
    return render(<CreateMode {...defaultProps} {...props} />);
}

describe("<MoveMode />", () => {

    test("Should display CreateMode with default setting", async () => {
        const { findByTestId } = renderCreateMode();
        const createMode = await findByTestId("createMode-div");

        expect(createMode).toHaveClass("draggable_container");
        expect(createMode).toHaveStyle({
            width: "100%",
            height: "1000px",
        });
    });

    test("Should invoke updateComponent", async () => {
        const updateFunction = jest.fn();

        const firebaseDataModel: FirebaseDataModel = {
            subscribeToComponent: () => { },
            updateComponent: updateFunction,
            removeComponent: () => { },
            registerComponentCreatedListener: () => { },
            registerComponentRemovedListener: () => { }
        };

        const { findByTestId } = renderCreateMode({firebaseDataModel: firebaseDataModel});
        
        const createMode = await findByTestId("createMode-div");
        fireEvent.click(createMode);
        
        expect(updateFunction).toHaveBeenCalledTimes(1);
    });
});