import CanvasTest, { NO_OP } from "./CanvasTest";
import { Props as CanvasProps } from "../../../main/ts/components/Canvas/BaseCanvas";
import StockModeCanvas from "../../../main/ts/components/Canvas/StockModeCanvas";
import { ReactElement } from "react";

class StockModeCanvasTest extends CanvasTest {

    protected getCanvasName(): string {
        return "StockModeCanvas";
    }

    protected makeCanvas(props: Partial<CanvasProps>): ReactElement {
        const DEFAULT_PROPS: CanvasProps = {
            firebaseDataModel: this.makeFirebaseDataModel(),
            selectedComponentId: null,
            sessionId: CanvasTest.AN_ID,
            children: [],
            editComponent: NO_OP,
            deleteComponent: NO_OP,
            addComponent: NO_OP,
            setSelected: NO_OP
        };
        return (
            <StockModeCanvas
                {...{ ...DEFAULT_PROPS, ...props }}
            />
        );
    }
}

new StockModeCanvasTest().describeTest();
