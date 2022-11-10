import React, { ReactElement } from 'react';
import { Stage, Layer, Group } from 'react-konva';

import FirebaseDataModel from '../../data/FirebaseDataModel';
import ComponentUiData, { VisibleUiComponent } from './ScreenObjects/ComponentUiData';
import { DEFAULT_COLOR, SELECTED_COLOR } from './ScreenObjects/Stock/Stock';
import FlowUiData from './ScreenObjects/Flow/FlowUiData';
import ComponentCollection from './ComponentCollection';
import ComponentRenderer from './Renderer/ComponentRenderer';

const RIGHT_CLICK = 2;
export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    components: ComponentCollection;
    renderer: ComponentRenderer;
    selectedComponentIds: string[];
    showConnectionHandles: boolean;

    addComponent: (_: ComponentUiData) => void;
    editComponent: (_: ComponentUiData) => void;
    deleteComponent: (id: string) => void;
    setSelected: (ids: string[]) => void;
    identifyComponents: (replaced: ComponentUiData, replacement: ComponentUiData) => void;

    // visible for testing
    // TODO make these non-optional and send them up by 1 layer
    registerComponentClickedHandler?: (callback: ((c: VisibleUiComponent) => void)) => void;
    registerCanvasLeftClickedHandler?: (callback: ((x: number, y: number) => void)) => void;
    registerCanvasRightClickedHandler?: (callback: ((x: number, y: number) => void)) => void;
}

export interface State {

}

export class ComponentNotFoundError extends Error { }


export abstract class ExtendableBaseCanvas
    <CanvasProps extends Props, CanvasState extends State>
    extends React.Component<CanvasProps, CanvasState>
{

    protected constructor(props: CanvasProps) {
        super(props);
    }

    protected onCanvasLeftClicked(x: number, y: number): void {
        this.setNoneSelected();
    }

    protected onCanvasRightClicked(x: number, y: number): void {
        this.setNoneSelected();
    }

    protected setNoneSelected(): void {
        this.props.setSelected([]);
    }

    protected onComponentClicked(comp: VisibleUiComponent): void {
        this.props.setSelected([comp.getId()]);
    }

    protected renderModeSpecificLayer(): ReactElement {
        return (<Group />);
    }

    protected onCanvasMouseDown(x: number, y: number): void { }

    protected onCanvasMouseUp(x: number, y: number): void { }

    protected onCanvasMouseMoved(x: number, y: number): void { }

    protected onComponentMouseDown(comp: VisibleUiComponent, x: number, y: number): void { }

    protected onComponentMouseUp(comp: VisibleUiComponent, x: number, y: number): void { }

    protected isDraggable(comp: VisibleUiComponent): boolean {
        return true;
    }

    protected getFlows(): FlowUiData[] {
        return this.props.components.getFlows();
    }

    public render(): ReactElement {
        this.registerArtificialClickListeners(); // for testing

        return (
            <Stage
                width={window.innerWidth}
                height={15000}
                data-testid={"CanvasStage"}
                onClick={e => this.onClick(e)}
                onMouseDown={e => this.onMouseDown(e)}
                onMouseUp={e => this.onMouseUp(e)}
                onMouseMove={e => this.onMouseMove(e)}
                onContextMenu={e => {
                    e.evt.preventDefault();
                }}
            >
                <Layer>
                    {
                        this.props.renderer.render(
                            this.props.components,
                            null,
                            c => this.getComponentColor(c),
                            c => this.props.editComponent(c),
                            this.props.showConnectionHandles,
                            true,
                        )
                    }
                </Layer>
                <Layer>
                    {this.renderModeSpecificLayer()}
                </Layer>
            </Stage>
        );
    }

    private onClick(event: any): void {
        const target = this.props.components.getComponent(event.target.attrs.name);
        const pointerPos = event.currentTarget.getPointerPosition();

        const isRightClick = event.evt.button === RIGHT_CLICK;
        if (target && target.isVisible()) {
            this.onComponentClicked(target as VisibleUiComponent)
        }
        else if (isRightClick) {
            this.onCanvasRightClicked(pointerPos.x, pointerPos.y);
        }
        else {
            this.onCanvasLeftClicked(pointerPos.x, pointerPos.y);
        }
    }

    private onMouseDown(event: any): void {
        const target = this.props.components.getComponent(event.target.attrs.name);
        const pointerPos = event.currentTarget.getPointerPosition();

        if (target && target.isVisible()) {
            this.onComponentMouseDown(target as VisibleUiComponent, pointerPos.x, pointerPos.y);
        }
        else {
            this.onCanvasMouseDown(pointerPos.x, pointerPos.y);
        }
    }

    private onMouseUp(event: any): void {
        const target = this.props.components.getComponent(event.target.attrs.name);
        const pointerPos = event.currentTarget.getPointerPosition();

        if (target && target.isVisible()) {
            this.onComponentMouseUp(target as VisibleUiComponent, pointerPos.x, pointerPos.y);
        }
        else {
            this.onCanvasMouseUp(pointerPos.x, pointerPos.y);
        }
    }

    private onMouseMove(event: any): void {
        const pointerPos = event.currentTarget.getPointerPosition();
        this.onCanvasMouseMoved(pointerPos.x, pointerPos.y);
    }

    private registerArtificialClickListeners(): void {
        if (this.props.registerCanvasLeftClickedHandler)
            this.props.registerCanvasLeftClickedHandler((x, y) => this.onCanvasLeftClicked(x, y));
        if (this.props.registerCanvasRightClickedHandler)
            this.props.registerCanvasRightClickedHandler((x, y) => this.onCanvasRightClicked(x, y));
        if (this.props.registerComponentClickedHandler)
            this.props.registerComponentClickedHandler(c => this.onComponentClicked(c));
    }

    private getComponentColor(component: ComponentUiData): string {
        return this.props.selectedComponentIds.includes(component.getId())
            ? SELECTED_COLOR : DEFAULT_COLOR;
    }


    protected belongsToModel(componentId: string, modelId: string | undefined): boolean {
        const subbedComponents = this.props.components.withSubstitutionsApplied();
        const model = subbedComponents.getStaticModels().find(sm => sm.getData().modelId === modelId);
        const components = model?.getComponents() || subbedComponents.getAllComponentsWithoutChildren();
        return components.findIndex(c => c.getId() === componentId) >= 0;
    }
}

export default abstract class BaseCanvas extends ExtendableBaseCanvas<Props, State> { }

