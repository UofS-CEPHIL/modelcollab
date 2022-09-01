
import { ReactElement } from "react";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import FlowModeCanvas from "../../../../main/ts/components/Canvas/FlowModeCanvas";
import MoveModeCanvas from "../../../../main/ts/components/Canvas/MoveModeCanvas";
import StockModeCanvas from "../../../../main/ts/components/Canvas/StockModeCanvas";
import ConnectionModeCanvas from "../../../../main/ts/components/Canvas/ConnectModeCanvas";
import VariableModeCanvas from "../../../../main/ts/components/Canvas/DynamicVariableModeCanvas";
import SumVariableModeCanvas from "../../../../main/ts/components/Canvas/SumVariableModeCanvas";
import ParameterModeCanvas from "../../../../main/ts/components/Canvas/ParamModeCanvas";
import CanvasUtils from "./CanvasUtils";
import CloudModeCanvas from "../../../../main/ts/components/Canvas/CloudModeCanvas";
import EditModeCanvas from "../../../../main/ts/components/Canvas/EditModeCanvas";
import DeleteModeCanvas from "../../../../main/ts/components/Canvas/DeleteModeCanvas";
import MockFirebaseDataModel from "../../data/MockFirebaseDataModel";
import { act } from "react-dom/test-utils";
import ComponentUiData from "../../../../main/ts/components/ScreenObjects/ComponentUiData";


export const DEFAULT_ID = "0";

export default abstract class CanvasWithMocks {

    public readonly props: CanvasProps;

    public readonly editComponentSpy: jest.Mock<void> | undefined;
    public readonly deleteComponentSpy: jest.Mock<void> | undefined;
    public readonly addComponentSpy: jest.Mock<void> | undefined;
    public readonly setSelectedSpy: jest.Mock<void> | undefined;

    public readonly makeStockSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeFlowSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeConnSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeSumVarSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeDynVarSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeParamSpy: jest.Mock<ReactElement> | undefined;
    public readonly makeCloudSpy: jest.Mock<ReactElement> | undefined;

    public readonly registerComponentClickedSpy: jest.Mock<void> | undefined;
    public readonly registerCanvasClickedSpy: jest.Mock<void> | undefined;

    public abstract render(): ReactElement;

    public constructor(props: Partial<CanvasProps>) {
        this.editComponentSpy = jest.fn();
        this.deleteComponentSpy = jest.fn();
        this.addComponentSpy = jest.fn();
        this.setSelectedSpy = jest.fn();
        this.makeStockSpy = jest.fn();
        this.makeFlowSpy = jest.fn();
        this.makeConnSpy = jest.fn();
        this.makeSumVarSpy = jest.fn();
        this.makeDynVarSpy = jest.fn();
        this.makeParamSpy = jest.fn();
        this.makeCloudSpy = jest.fn();
        this.registerComponentClickedSpy = jest.fn();
        this.registerCanvasClickedSpy = jest.fn();

        const DEFAULT_PROPS: CanvasProps = {
            firebaseDataModel: new MockFirebaseDataModel(),
            selectedComponentId: null,
            sessionId: DEFAULT_ID,
            children: [],
            editComponent: this.editComponentSpy,
            deleteComponent: this.deleteComponentSpy,
            addComponent: this.addComponentSpy,
            setSelected: this.setSelectedSpy,
            showConnectionHandles: false,
            makeStock: this.makeStockSpy,
            makeFlow: this.makeFlowSpy,
            makeConnection: this.makeConnSpy,
            makeSumVar: this.makeSumVarSpy,
            makeParam: this.makeParamSpy,
            makeCloud: this.makeCloudSpy,
            makeDynVar: this.makeDynVarSpy,
            registerCanvasClickedHandler: this.registerCanvasClickedSpy,
            registerComponentClickedHandler: this.registerComponentClickedSpy
        };
        this.props = { ...DEFAULT_PROPS, ...props };
    }

    public getComponentCreatorFunctions(): object {
        return {
            makeStock: this.makeStockSpy,
            makeFlow: this.makeFlowSpy,
            makeConn: this.makeConnSpy,
            makeSumVar: this.makeSumVarSpy,
            makeDynVar: this.makeDynVarSpy,
            makeParam: this.makeParamSpy,
            makeCloud: this.makeCloudSpy
        };
    }

    public getActionFunctions(): object {
        return {
            editComponent: this.editComponentSpy,
            addComponent: this.addComponentSpy,
            deleteComponent: this.deleteComponentSpy,
            setSelected: this.setSelectedSpy
        };
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

    public clickCanvas(x: number, y: number): void {
        if (!this.registerCanvasClickedSpy) throw new Error();
        expect(this.registerCanvasClickedSpy).toHaveBeenCalled();
        const canvasClickedCallback = this.registerCanvasClickedSpy.mock.lastCall[0];
        act(() => canvasClickedCallback(x, y));
    }

    public clickComponent(component: ComponentUiData): void {
        if (!this.registerComponentClickedSpy) throw new Error();
        expect(this.registerComponentClickedSpy).toHaveBeenCalled();
        const componentClickedCallback = this.registerComponentClickedSpy.mock.lastCall[0];
        act(() => componentClickedCallback(component));
    }

    public expectNothingHappened(): void {
        Object.values(this.getActionFunctions()).forEach(f =>
            expect(f).not.toHaveBeenCalled()
        );
    }
}


export class StockModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<StockModeCanvas {...this.props} />);
    }
}

export class MoveModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<MoveModeCanvas {...this.props} />);
    }
}

export class FlowModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<FlowModeCanvas {...this.props} />)
    }
}

export class EditModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<EditModeCanvas {...this.props} />);
    }
}

export class ConnectionModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<ConnectionModeCanvas {...this.props} />)
    }
}

export class VariableModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<VariableModeCanvas {...this.props} />)
    }
}

export class SumVarModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<SumVariableModeCanvas {...this.props} />)
    }
}

export class ParameterModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<ParameterModeCanvas {...this.props} />)
    }
}

export class DeleteModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<DeleteModeCanvas {...this.props} />);
    }
}

export class CloudModeCanvasMock extends CanvasWithMocks {
    public render(): ReactElement {
        return (<CloudModeCanvas {...this.props} />)
    }
}

