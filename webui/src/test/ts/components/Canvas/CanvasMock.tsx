
import { ReactElement } from "react";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import StockModeCanvas from "../../../../main/ts/components/Canvas/StockModeCanvas";
import FirebaseDataModel from "../../../../main/ts/data/FirebaseDataModel";

export const NO_OP = () => { };
export const DEFAULT_ID = "0";

export default abstract class CanvasMock {

    public readonly props: CanvasProps;
    public readonly makeStockSpy: jest.Mock<ReactElement>;
    public readonly makeFlowSpy: jest.Mock<ReactElement>;
    public readonly makeConnSpy: jest.Mock<ReactElement>;
    public readonly makeSumVarSpy: jest.Mock<ReactElement>;
    public readonly makeDynVarSpy: jest.Mock<ReactElement>;
    public readonly makeParamSpy: jest.Mock<ReactElement>;
    public readonly makeCloudSpy: jest.Mock<ReactElement>;

    public abstract render(): ReactElement;

    public constructor(
        props: Partial<CanvasProps>
    ) {
        this.makeStockSpy = jest.fn();
        this.makeFlowSpy = jest.fn();
        this.makeConnSpy = jest.fn();
        this.makeSumVarSpy = jest.fn();
        this.makeDynVarSpy = jest.fn();
        this.makeParamSpy = jest.fn();
        this.makeCloudSpy = jest.fn();

        const DEFAULT_PROPS: CanvasProps = {
            firebaseDataModel: CanvasMock.makeFirebaseDataModel(),
            selectedComponentId: null,
            sessionId: DEFAULT_ID,
            children: [],
            editComponent: NO_OP,
            deleteComponent: NO_OP,
            addComponent: NO_OP,
            setSelected: NO_OP,
            makeStock: this.makeStockSpy,
            makeFlow: this.makeFlowSpy,
            makeConnection: this.makeConnSpy,
            makeSumVar: this.makeSumVarSpy,
            makeParam: this.makeParamSpy,
            makeCloud: this.makeCloudSpy
        };
        this.props = { ...DEFAULT_PROPS, ...props };
    }

    public static makeFirebaseDataModel(mockFuncs?: Partial<FirebaseDataModel>): FirebaseDataModel {
        const emptyDataModel: FirebaseDataModel = {
            updateComponent: NO_OP,
            subscribeToComponent: NO_OP,
            subscribeToSession: NO_OP,
            subscribeToSessionList: NO_OP,
            addSession: NO_OP,
            removeComponent: NO_OP,
            registerComponentCreatedListener: NO_OP,
            registerComponentRemovedListener: NO_OP
        };
        return { ...emptyDataModel, ...mockFuncs };
    }

    public expectNoComponentsRendered(): void {
        this.expectNoStocksRendered();
        this.expectNoFlowsRendered();
        this.expectNoConnectionsRendered();
        this.expectNoDynVarsRendered();
        this.expectNoSumVarsRendered();
        this.expectNoParamsRendered();
        this.expectNoCloudsRendered();
    }

    public expectNoStocksRendered(): void {
        expect(this.makeStockSpy.mock.calls.length).toBe(0);
    }

    public expectNoFlowsRendered(): void {
        expect(this.makeFlowSpy.mock.calls.length).toBe(0);
    }

    public expectNoConnectionsRendered(): void {
        expect(this.makeConnSpy.mock.calls.length).toBe(0);
    }

    public expectNoDynVarsRendered(): void {
        expect(this.makeDynVarSpy.mock.calls.length).toBe(0);
    }

    public expectNoSumVarsRendered(): void {
        expect(this.makeSumVarSpy.mock.calls.length).toBe(0);
    }

    public expectNoParamsRendered(): void {
        expect(this.makeParamSpy.mock.calls.length).toBe(0);
    }

    public expectNoCloudsRendered(): void {
        expect(this.makeCloudSpy.mock.calls.length).toBe(0);
    }
}

export class StockModeCanvasMock extends CanvasMock {
    public render(): ReactElement {
        return (<StockModeCanvas {...this.props} />);
    }
}

