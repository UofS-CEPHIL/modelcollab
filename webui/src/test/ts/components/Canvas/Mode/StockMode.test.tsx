import { render, fireEvent } from "@testing-library/react";
import StockMode, { Props } from "../../../../../main/ts/components/Canvas/Mode/StockMode";
import FirebaseDataModel from '../../../../../main/ts/data/FirebaseDataModel';
import { DataContainer } from '../../../../../main/ts/data/DataContainer';

const TEST_SESSION_ID: string = "0";

function renderStockMode(props: Partial<Props> = {}) {
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
    return render(<StockMode {...defaultProps} {...props} />);
}

describe("<StockMode />", () => {

    test("Should display StockMode with default setting", async () => {
        const { findByTestId } = renderStockMode();
        const stockMode = await findByTestId("stockMode-div");

        expect(stockMode).toHaveClass("draggable_container");
        expect(stockMode).toHaveStyle({
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

        const { findByTestId } = renderStockMode({firebaseDataModel: firebaseDataModel});
        
        const stockMode = await findByTestId("stockMode-div");
        fireEvent.click(stockMode);
        
        expect(updateFunction).toHaveBeenCalledTimes(1);
    });
});