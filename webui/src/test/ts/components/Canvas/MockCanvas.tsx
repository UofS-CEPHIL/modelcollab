import { ReactElement } from "react";
import { act } from "react-dom/test-utils";
import { FirebaseComponentModel as schema } from "database/build/export";

import { Props as CanvasProps } from "../../../../main/ts/components/Canvas/BaseCanvas";
import FlowModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/FlowModeCanvas";
import MoveModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/MoveModeCanvas";
import StockModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/StockModeCanvas";
import ConnectionModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/ConnectModeCanvas";
import VariableModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/DynamicVariableModeCanvas";
import SumVariableModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/SumVariableModeCanvas";
import ParameterModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/ParamModeCanvas";
import CloudModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/CloudModeCanvas";
import EditModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/EditModeCanvas";
import DeleteModeCanvas from "../../../../main/ts/components/Canvas/ModeCanvas/DeleteModeCanvas";
import MockFirebaseDataModel from "../../data/MockFirebaseDataModel";
import ComponentUiData from "../../../../main/ts/components/Canvas/ScreenObjects/ComponentUiData";
import ComponentCollection from "../../../../main/ts/components/Canvas/ComponentCollection";
import MockRenderer from "./MockRenderer";
import { getAllComponentsFromFirstRenderCall } from "./CanvasTest";


export const DEFAULT_ID = "0";

export default abstract class MockCanvas {

    public readonly props: CanvasProps;

    public readonly mockRenderer: MockRenderer | undefined;

    public readonly editComponentSpy: jest.Mock<void> | undefined;
    public readonly deleteComponentSpy: jest.Mock<void> | undefined;
    public readonly addComponentSpy: jest.Mock<void> | undefined;
    public readonly setSelectedSpy: jest.Mock<void> | undefined;
    public readonly identifyStocksSpy: jest.Mock<void> | undefined;

    public readonly registerComponentClickedSpy: jest.Mock<void> | undefined;
    public readonly registerCanvasLeftClickedSpy: jest.Mock<void> | undefined;
    public readonly registerCanvasRightClickedSpy: jest.Mock<void> | undefined;

    public abstract render(): ReactElement;

    public constructor(props: Partial<CanvasProps>) {
        this.editComponentSpy = jest.fn();
        this.deleteComponentSpy = jest.fn();
        this.addComponentSpy = jest.fn();
        this.setSelectedSpy = jest.fn();
        this.identifyStocksSpy = jest.fn();
        this.mockRenderer = new MockRenderer();
        this.registerComponentClickedSpy = jest.fn();
        this.registerCanvasLeftClickedSpy = jest.fn();
        this.registerCanvasRightClickedSpy = jest.fn();

        const DEFAULT_PROPS: CanvasProps = {
            firebaseDataModel: new MockFirebaseDataModel(),
            selectedComponentIds: [],
            sessionId: DEFAULT_ID,
            components: new ComponentCollection([]),
            renderer: this.mockRenderer,
            editComponent: this.editComponentSpy,
            deleteComponent: this.deleteComponentSpy,
            addComponent: this.addComponentSpy,
            setSelected: this.setSelectedSpy,
            identifyStocks: this.identifyStocksSpy,
            showConnectionHandles: false,
            registerCanvasLeftClickedHandler: this.registerCanvasLeftClickedSpy,
            registerCanvasRightClickedHandler: this.registerCanvasRightClickedSpy,
            registerComponentClickedHandler: this.registerComponentClickedSpy
        };
        this.props = { ...DEFAULT_PROPS, ...props };
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

    private expectNoneOfTypeRendered(type: schema.ComponentType): void {
        if (this.mockRenderer === undefined) throw new Error();
        const allComponents = getAllComponentsFromFirstRenderCall(this.mockRenderer);
        expect(
            allComponents.filter(c => c.getType() === type).length
        ).toBe(0);
    }

    public expectNoStocksRendered(): void {
        return this.expectNoneOfTypeRendered(schema.ComponentType.STOCK);
    }

    public expectNoFlowsRendered(): void {
        return this.expectNoneOfTypeRendered(schema.ComponentType.FLOW);
    }

    public expectNoConnectionsRendered(): void {
        return this.expectNoneOfTypeRendered(schema.ComponentType.CONNECTION);
    }

    public expectNoDynVarsRendered(): void {
        return this.expectNoneOfTypeRendered(schema.ComponentType.VARIABLE);
    }

    public expectNoSumVarsRendered(): void {
        return this.expectNoneOfTypeRendered(schema.ComponentType.SUM_VARIABLE);
    }

    public expectNoParamsRendered(): void {
        return this.expectNoneOfTypeRendered(schema.ComponentType.PARAMETER);
    }

    public expectNoCloudsRendered(): void {
        return this.expectNoneOfTypeRendered(schema.ComponentType.CLOUD);
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



export class StockModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<StockModeCanvas {...this.props} />);
    }
}

export class MoveModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<MoveModeCanvas {...this.props} />);
    }
}

export class FlowModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<FlowModeCanvas {...this.props} />)
    }
}

export class EditModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<EditModeCanvas {...this.props} />);
    }
}

export class ConnectionModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<ConnectionModeCanvas {...this.props} />)
    }
}

export class VariableModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<VariableModeCanvas {...this.props} />)
    }
}

export class SumVarModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<SumVariableModeCanvas {...this.props} />)
    }
}

export class ParameterModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<ParameterModeCanvas {...this.props} />)
    }
}

export class DeleteModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<DeleteModeCanvas {...this.props} />);
    }
}

export class CloudModeCanvasSpy extends MockCanvas {
    public render(): ReactElement {
        return (<CloudModeCanvas {...this.props} />)
    }
}

