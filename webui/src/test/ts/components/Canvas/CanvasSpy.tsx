
import { ReactElement } from "react";
import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import FlowModeCanvas from "../../../../main/ts/components/Canvas/FlowModeCanvas";
import MoveModeCanvas from "../../../../main/ts/components/Canvas/MoveModeCanvas";
import StockModeCanvas from "../../../../main/ts/components/Canvas/StockModeCanvas";
import ConnectionModeCanvas from "../../../../main/ts/components/Canvas/ConnectModeCanvas";
import VariableModeCanvas from "../../../../main/ts/components/Canvas/DynamicVariableModeCanvas";
import SumVariableModeCanvas from "../../../../main/ts/components/Canvas/SumVariableModeCanvas";
import ParameterModeCanvas from "../../../../main/ts/components/Canvas/ParamModeCanvas";
import CloudModeCanvas from "../../../../main/ts/components/Canvas/CloudModeCanvas";
import EditModeCanvas from "../../../../main/ts/components/Canvas/EditModeCanvas";
import DeleteModeCanvas from "../../../../main/ts/components/Canvas/DeleteModeCanvas";
import MockFirebaseDataModel from "../../data/MockFirebaseDataModel";
import { act } from "react-dom/test-utils";
import ComponentUiData from "../../../../main/ts/components/ScreenObjects/ComponentUiData";


export const DEFAULT_ID = "0";

export default abstract class CanvasSpy {

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
    public readonly registerCanvasLeftClickedSpy: jest.Mock<void> | undefined;
    public readonly registerCanvasRightClickedSpy: jest.Mock<void> | undefined;

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
        this.registerCanvasLeftClickedSpy = jest.fn();
        this.registerCanvasRightClickedSpy = jest.fn();

        const DEFAULT_PROPS: CanvasProps = {
            firebaseDataModel: new MockFirebaseDataModel(),
            selectedComponentIds: [],
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
            registerCanvasLeftClickedHandler: this.registerCanvasLeftClickedSpy,
            registerCanvasRightClickedHandler: this.registerCanvasRightClickedSpy,
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

    public getComponentUpdateCallbacks(): object {
        return {
            editComponent: this.editComponentSpy,
            addComponent: this.addComponentSpy,
            deleteComponent: this.deleteComponentSpy,
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

    public leftClickCanvas(x: number, y: number): void {
        if (!this.registerCanvasLeftClickedSpy) throw new Error();
        expect(this.registerCanvasLeftClickedSpy).toHaveBeenCalled();
        const canvasClickedCallback = this.registerCanvasLeftClickedSpy.mock.lastCall[0];
        act(() => canvasClickedCallback(x, y));
    }

    public rightClickCanvas(x: number, y: number): void {
        if (!this.registerCanvasRightClickedSpy) throw new Error();
        expect(this.registerCanvasRightClickedSpy).toHaveBeenCalled();
        const canvasClickedCallback = this.registerCanvasRightClickedSpy.mock.lastCall[0];
        act(() => canvasClickedCallback(x, y));
    }

    public clickComponent(component: ComponentUiData): void {
        if (!this.registerComponentClickedSpy) throw new Error();
        expect(this.registerComponentClickedSpy).toHaveBeenCalled();
        const componentClickedCallback = this.registerComponentClickedSpy.mock.lastCall[0];
        act(() => componentClickedCallback(component));
    }

    public expectNothingHappened(): void {
        Object.values(this.getComponentUpdateCallbacks()).forEach(f =>
            expect(f).not.toHaveBeenCalled()
        );
        this.expectNothingEverSelected();
    }

    public expectNothingEverSelected(): void {
        this.setSelectedSpy?.mock.calls.forEach(
            c => expect(c[0]).toEqual([])
        );
    }
}



export class StockModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<StockModeCanvas {...this.props} />);
    }
}

export class MoveModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<MoveModeCanvas {...this.props} />);
    }
}

export class FlowModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<FlowModeCanvas {...this.props} />)
    }
}

export class EditModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<EditModeCanvas {...this.props} />);
    }
}

export class ConnectionModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<ConnectionModeCanvas {...this.props} />)
    }
}

export class VariableModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<VariableModeCanvas {...this.props} />)
    }
}

export class SumVarModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<SumVariableModeCanvas {...this.props} />)
    }
}

export class ParameterModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<ParameterModeCanvas {...this.props} />)
    }
}

export class DeleteModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<DeleteModeCanvas {...this.props} />);
    }
}

export class CloudModeCanvasSpy extends CanvasSpy {
    public render(): ReactElement {
        return (<CloudModeCanvas {...this.props} />)
    }
}

