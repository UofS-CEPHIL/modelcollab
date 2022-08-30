
import { ReactElement } from "react";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import FlowModeCanvas from "../../../../main/ts/components/Canvas/FlowModeCanvas";
import MoveModeCanvas from "../../../../main/ts/components/Canvas/MoveModeCanvas";
import StockModeCanvas from "../../../../main/ts/components/Canvas/StockModeCanvas";
import ConnectionModeCanvas from "../../../../main/ts/components/Canvas/ConnectModeCanvas";
import VariableModeCanvas from "../../../../main/ts/components/Canvas/DynamicVariableModeCanvas";
import SumVariableModeCanvas from "../../../../main/ts/components/Canvas/SumVariableModeCanvas";
import ParameterModeCanvas from "../../../../main/ts/components/Canvas/ParamModeCanvas";
import FirebaseDataModel from "../../../../main/ts/data/FirebaseDataModel";

export const NO_OP = () => { };
export const DEFAULT_ID = "0";

export default abstract class CanvasMock {

    public readonly props: CanvasProps;
    public readonly makeStockSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeFlowSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeConnSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeSumVarSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeDynVarSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeParamSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeCloudSpy: jest.Mock<ReactElement> | undefined;
    public getSpies(): object {
        return {
            "makeStock": this.makeStockSpy,
            "makeFlow": this.makeFlowSpy,
            "makeConn": this.makeConnSpy,
            "makeSumVar": this.makeSumVarSpy,
            "makeDynVar": this.makeDynVarSpy,
            "makeParam": this.makeParamSpy,
            "makeCloud": this.makeCloudSpy
        };
    }

    public abstract render(): ReactElement;

    public constructor(props: Partial<CanvasProps>) {
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
            showConnectionHandles: false,
            makeStock: this.makeStockSpy,
            makeFlow: this.makeFlowSpy,
            makeConnection: this.makeConnSpy,
            makeSumVar: this.makeSumVarSpy,
            makeParam: this.makeParamSpy,
            makeCloud: this.makeCloudSpy,
            makeDynVar: this.makeDynVarSpy
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
        if (this.makeStockSpy === undefined) throw new Error();
        expect(this.makeStockSpy.mock.calls.length).toBe(0);
    }

    public expectNoFlowsRendered(): void {
        if (this.makeFlowSpy === undefined) throw new Error();
        expect(this.makeFlowSpy.mock.calls.length).toBe(0);
    }

    public expectNoConnectionsRendered(): void {
        if (this.makeConnSpy === undefined) throw new Error();
        expect(this.makeConnSpy.mock.calls.length).toBe(0);
    }

    public expectNoDynVarsRendered(): void {
        if (this.makeDynVarSpy === undefined) throw new Error();
        expect(this.makeDynVarSpy.mock.calls.length).toBe(0);
    }

    public expectNoSumVarsRendered(): void {
        if (this.makeSumVarSpy === undefined) throw new Error();
        expect(this.makeSumVarSpy.mock.calls.length).toBe(0);
    }

    public expectNoParamsRendered(): void {
        if (this.makeParamSpy === undefined) throw new Error();
        expect(this.makeParamSpy.mock.calls.length).toBe(0);
    }

    public expectNoCloudsRendered(): void {
        if (this.makeCloudSpy === undefined) throw new Error();
        expect(this.makeCloudSpy.mock.calls.length).toBe(0);
    }
}


export class StockModeCanvasMock extends CanvasMock {
    public render(): ReactElement {
        return (<StockModeCanvas {...this.props} />);
    }
}

export class MoveModeCanvasMock extends CanvasMock {
    public render(): ReactElement {
        return (<MoveModeCanvas {...this.props} />);
    }
}

export class FlowModeCanvasMock extends CanvasMock {
    public render(): ReactElement {
        return (<FlowModeCanvas {...this.props} />)
    }
}

export class ConnectionModeCanvasMock extends CanvasMock {
    public render(): ReactElement {
        return (<ConnectionModeCanvas {...this.props} />)
    }
}

export class VariableModeCanvasMock extends CanvasMock {
    public render(): ReactElement {
        return (<VariableModeCanvas {...this.props} />)
    }
}

export class SumVarModeCanvasMock extends CanvasMock {
    public render(): ReactElement {
        return (<SumVariableModeCanvas {...this.props} />)
    }
}

export class ParameterModeCanvasMock extends CanvasMock {
    public render(): ReactElement {
        return (<ParameterModeCanvas {...this.props} />)
    }
}

