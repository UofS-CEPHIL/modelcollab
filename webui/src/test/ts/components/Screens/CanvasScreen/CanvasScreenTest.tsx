import CanvasScreen, { Props as ScreenProps } from "../../../../../main/ts/components/Screens/CanvasScreen";
import CanvasUtils from "../../Canvas/CanvasUtils";
import { FirebaseComponentModel as schema } from "database/build/export";
import { ReactElement } from "react";
import { Root } from "react-dom/client";
import MockToolbar from "../../Toolbar/MockToolbar";
import MockEditBox from "../../EditBox/MockEditBox";
import MockFirebaseDataModel from "../../../data/MockFirebaseDataModel";
import MockSaveModelBox from "../../SaveModelBox/MockSaveModelBox";
import MockRenderer from "../../Canvas/MockRenderer";


/*
  This needs to be done in order to make tests with Konva behave
  properly
 */
declare global {
    var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;



export default abstract class CanvasScreenTest {

    public static readonly AN_ID: string = "0";

    protected containerNode: HTMLElement | null = null;
    protected root: Root | null = null;
    protected returnToSessionSelect: jest.Mock<void> | null = null;
    protected createCanvasForMode: jest.Mock<ReactElement> | null = null;
    protected createToolbar: jest.Mock<ReactElement> | null = null;
    protected createSaveModelBox: jest.Mock<ReactElement> | null = null;
    protected lastRenderedSaveModelBox: MockSaveModelBox | null = null;
    protected lastRenderedToolbar: MockToolbar | null = null;
    protected createEditBox: jest.Mock<ReactElement> | null = null;
    protected lastRenderedEditBox: MockEditBox | null = null;
    protected firebaseDataModel: MockFirebaseDataModel | null = null;
    protected renderer: MockRenderer | null = null;

    public abstract describeTests(): void;

    protected createSimulationScreen(props: Partial<ScreenProps>): ReactElement {
        const DEFAULT_PROPS: ScreenProps = {
            firebaseDataModel: new MockFirebaseDataModel(),
            sessionId: CanvasScreenTest.AN_ID,
            returnToSessionSelect: CanvasUtils.NO_OP,
            createCanvasForMode: CanvasUtils.createCanvasWithMocksForMode,
            createEditBox: p => new MockEditBox(p).render(),
            createToolbar: p => new MockToolbar(p).render(),
            createSaveModelBox: p => new MockSaveModelBox(p).render(),
            renderer: new MockRenderer()
        };
        return (
            <CanvasScreen
                {...DEFAULT_PROPS}
                {...props}
            />
        );
    }

    protected static createArbitraryStock(): schema.StockFirebaseComponent {
        const id = "123";
        const x = 0;
        const y = 0;
        const text = "text";
        const initvalue = "value";
        return new schema.StockFirebaseComponent(id, { x, y, text, initvalue });
    }
}
