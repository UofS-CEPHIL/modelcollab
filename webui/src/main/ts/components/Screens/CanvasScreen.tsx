import React, { ReactElement } from 'react';

import { FirebaseComponentModel as schema } from "database/build/export";

import ComponentUiData, { PointerComponent } from '../Canvas/ScreenObjects/ComponentUiData';
import { Props as CanvasProps } from "../Canvas/BaseCanvas";
import { Props as ToolbarProps } from '../Toolbar/Toolbar';
import { UiMode } from '../../UiMode';
import applicationConfig from '../../config/applicationConfig';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { Props as EditBoxProps } from '../EditBox/EditBox';
import { Props as SaveModelBoxProps } from "../SaveModelBox/SaveModelBox";
import StockUiData from '../Canvas/ScreenObjects/Stock/StockUiData';
import FlowUiData from '../Canvas/ScreenObjects/Flow/FlowUiData';
import ConnectionUiData from '../Canvas/ScreenObjects/Connection/ConnectionUiData';
import ParameterUiData from '../Canvas/ScreenObjects/Parameter/ParameterUiData';
import SumVariableUiData from '../Canvas/ScreenObjects/SumVariable/SumVariableUiData';
import DynamicVariableUiData from '../Canvas/ScreenObjects/DynamicVariable/DynamicVariableUiData';
import CloudUiData from '../Canvas/ScreenObjects/Cloud/CloudUiData';
import RestClientImpl from '../../rest/RestClientImpl';
import StaticModelUiData from '../Canvas/ScreenObjects/StaticModel/StaticModelUiData';
import IdGenerator from '../../IdGenerator';
import ComponentCollection from '../Canvas/ComponentCollection';
import ComponentRenderer from '../Canvas/Renderer/ComponentRenderer';


export interface LoadedStaticModel {
    modelId: string;
    components: ComponentUiData[];
}

export interface Props {
    firebaseDataModel: FirebaseDataModel;
    sessionId: string;
    returnToSessionSelect: () => void;
    renderer: ComponentRenderer;
    createCanvasForMode: (mode: UiMode, props: CanvasProps) => ReactElement;
    createToolbar: (props: ToolbarProps) => ReactElement;
    createEditBox: (props: EditBoxProps) => ReactElement;
    createSaveModelBox: (props: SaveModelBoxProps) => ReactElement;
}

interface State {
    mode: UiMode,
    components: ComponentUiData[];
    loadedModels: LoadedStaticModel[];
    selectedComponentIds: string[];
    showingSaveModelBox: boolean;
}

let lastMode: UiMode = UiMode.MOVE;


export default class CanvasScreen extends React.Component<Props, State> {

    private readonly dm: FirebaseDataModel;

    constructor(props: Props) {
        super(props);
        this.state = {
            mode: UiMode.MOVE,
            components: [],
            loadedModels: [],
            selectedComponentIds: [],
            showingSaveModelBox: false
        };
        this.dm = props.firebaseDataModel;
        document.title = applicationConfig.appName;
    }

    componentDidMount() {
        // This happens at mount instead of in constructor because
        // otherwise we end up trying to render the component before
        // it mounts and React gets upset
        this.dm.subscribeToSession(
            this.props.sessionId,
            (dbComponents: schema.FirebaseDataComponent<any>[]) => {
                // Load any static models that aren't already loaded
                dbComponents
                    .filter(c => c.getType() === schema.ComponentType.STATIC_MODEL)
                    .map(c => c as schema.StaticModelComponent)
                    .forEach(c => this.importStaticModel(c.getData().modelId));

                // Load objects s.t. stocks are loaded before flows,
                // and all pointable components are loaded before
                // pointers that reference them.
                const nonPointerComponents: ComponentUiData[] = dbComponents
                    .filter(c =>
                        !this.isPointerComponentType(c.getType())
                    )
                    .map(c => this.createUiComponent(c));

                const flowComponents: ComponentUiData[] = dbComponents
                    .filter(c => c.getType() === schema.ComponentType.FLOW)
                    .map(c => this.createUiComponent(c));

                const nonFlowPointerComponents: ComponentUiData[] = dbComponents
                    .filter(c =>
                        this.isPointerComponentType(c.getType())
                        && c.getType() !== schema.ComponentType.FLOW
                    ).map(c => this.createUiComponent(c));

                const components: ComponentUiData[] = nonPointerComponents
                    .concat(flowComponents)
                    .concat(nonFlowPointerComponents);

                this.setState({
                    ...this.state,
                    selectedComponentIds: this.state.selectedComponentIds
                        .filter(id => dbComponents.find(c => c.getId() === id)),
                    components
                });
            }
        );
    }

    private isPointerComponentType(componentType: string) {
        switch (componentType) {
            case schema.ComponentType.STOCK.toString(): return false;
            case schema.ComponentType.PARAMETER.toString(): return false;
            case schema.ComponentType.VARIABLE.toString(): return false;
            case schema.ComponentType.SUM_VARIABLE.toString(): return false;
            case schema.ComponentType.CLOUD.toString(): return false;
            case schema.ComponentType.STATIC_MODEL.toString(): return false;
            case schema.ComponentType.FLOW.toString(): return true;
            case schema.ComponentType.CONNECTION.toString(): return true;
            default: throw new Error("Unknown component: " + componentType);
        }
    }

    public render() {
        const setMode = (mode: UiMode) => {
            this.setState({ ...this.state, mode });
            if (lastMode !== mode)
                setTimeout(() => { this.setSelected([]) });
            lastMode = mode;
        }
        const selectedComponents = this.state.selectedComponentIds.map(
            id => this.state.components.find(c => c.getId() === id)
        );

        this.setComponentsForStaticModels();
        return (
            <React.Fragment>
                {

                    this.props.createToolbar({
                        mode: this.state.mode,
                        setMode: setMode,
                        returnToSessionSelect: this.props.returnToSessionSelect,
                        sessionId: this.props.sessionId,
                        downloadData: b => this.downloadData(b),
                        saveModel: () => this.saveModel(),
                        importModel: s => this.loadStaticModelData(s),
                        restClient: new RestClientImpl()
                    })
                }
                {
                    this.props.createCanvasForMode(
                        this.state.mode,
                        {
                            firebaseDataModel: this.dm,
                            sessionId: this.props.sessionId,
                            components: new ComponentCollection(this.state.components),
                            renderer: this.props.renderer,
                            selectedComponentIds: this.state.selectedComponentIds,
                            showConnectionHandles: false,
                            editComponent: c => this.updateComponent(c),
                            deleteComponent: id => this.removeComponent(id),
                            addComponent: c => this.addComponent(c),
                            setSelected: ids => this.setSelected(ids),
                            identifyStocks: (o, i) => this.identifyStocks(o, i)
                        }
                    )
                }
                {
                    (selectedComponents.length === 1 && this.shouldShowEditBox() && selectedComponents[0]) &&
                    this.props.createEditBox({
                        initialComponent: selectedComponents[0].getDatabaseObject(),
                        handleCancel: () => this.setSelected([]),
                        handleSave: (comp: schema.FirebaseDataComponent<any>) => {
                            const components: ComponentUiData[] = this.state.components
                                .filter(c => c.getId() !== comp.getId())
                                .concat(this.createUiComponent(comp));
                            this.dm.updateComponent(this.props.sessionId, comp);
                            this.setState({ ...this.state, components, selectedComponentIds: [] });
                        }
                    })
                }
                {
                    this.state.showingSaveModelBox &&
                    this.props.createSaveModelBox({
                        handleCancel: () => this.setState({ ...this.state, showingSaveModelBox: false }),
                        handleSave: id => {
                            this.setState({ ...this.state, showingSaveModelBox: false });
                            this.dm.addModelToLibrary(id, this.state.components);
                        }
                    })

                }
            </React.Fragment >
        );
    }

    private setComponentsForStaticModels(): void {
        this.state.components
            .filter(c => c.getType() === schema.ComponentType.STATIC_MODEL)
            .forEach(c => {
                let loadedModel = this.state.loadedModels.find(m => m.modelId === c.getData().modelId);
                if (loadedModel) {
                    const modelUiData = c as StaticModelUiData;
                    modelUiData.setComponents(loadedModel.components);
                }
            });
    }


    private shouldShowEditBox(): boolean {
        return this.state.mode === UiMode.EDIT;
    }

    private addComponent(newComponent: ComponentUiData): void {
        if (!this.state.components.find(c => c.getId() === newComponent.getId())) {
            if (newComponent.getType() === schema.ComponentType.STATIC_MODEL) {
                this.importStaticModel((newComponent as StaticModelUiData).getData().modelId);
            }
            else {
                this.setState(
                    {
                        ...this.state,
                        components: this.state.components.concat([newComponent])
                    }
                );
            }
            setTimeout(() => { this.setSelected([]) }); // ????? this is required, otherwise it ignores selection change
            this.dm.updateComponent(this.props.sessionId, newComponent.getDatabaseObject());
        }
    }

    private importStaticModel(modelId: string): void {
        this.dm.getComponentsForSavedModel(
            modelId,
            components => {
                if (this.state.loadedModels.find(m => m.modelId === modelId) === undefined) {
                    const newComponents = components.map(c => this.createUiComponent(c))
                    this.setState({
                        ...this.state,
                        loadedModels: [
                            ...this.state.loadedModels,
                            {
                                modelId,
                                components: newComponents
                            }

                        ]
                    });
                }
            }
        );
    }

    private loadStaticModelData(modelId: string): void {
        this.addComponent(
            new StaticModelUiData(
                new schema.StaticModelComponent(
                    IdGenerator.generateUniqueId(this.state.components),
                    {
                        x: 0,
                        y: 0,
                        color: 'green',
                        modelId
                    }
                )
            )
        );
        this.importStaticModel(modelId);
    }

    private removeComponent(id: string): void {
        const findOrphans = (component: ComponentUiData) => {
            return this.state.components
                .filter(c => this.isPointerComponentType(c.getType()))
                .filter(c =>
                    c.getData().from === component.getId()
                    || c.getData().to === component.getId()
                );
        }
        const findOrphansRecursively = (component: ComponentUiData) => {
            // What a lot of orphans
            let orphans: ComponentUiData[] = [];
            let newOrphans: ComponentUiData[] = [component];
            while (newOrphans.length > 0) {
                let newNewOrphans: ComponentUiData[] = [];
                for (const orphan of newOrphans) {
                    const subOrphans = findOrphans(orphan);
                    const unique = subOrphans.filter(o => {
                        return orphans.find(c => c.getId() === o.getId()) === undefined
                    });
                    orphans = orphans.concat(unique);
                    newNewOrphans = newNewOrphans.concat(unique);
                }
                newOrphans = newNewOrphans;
            }
            return orphans;
        }

        const component = this.state.components.find(c => c.getId() === id);
        if (component) {
            const orphans = findOrphansRecursively(component);
            const components = this.state.components
                .filter(c => c.getId() !== id)
                .filter(c => { return orphans.find(o => o.getId() === c.getId()) === undefined });
            this.setState(
                {
                    ...this.state,
                    components
                }
            );
            this.dm.removeComponents(
                this.props.sessionId,
                [...orphans.map(o => o.getId()), component.getId()],
                this.state.components
            );
        }
    }

    private updateComponent(newComponent: ComponentUiData): void {
        const oldComponent = this.state.components.find(c => c.getId() === newComponent.getId());
        if (!oldComponent) throw new Error();
        let newComponentsList: ComponentUiData[];
        const xDiff = (newComponent.getData().x || 0) - (oldComponent.getData().x || 0);
        const yDiff = (newComponent.getData().y || 0) - (oldComponent.getData().y || 0);
        if ((xDiff === 0 && yDiff === 0) || this.state.selectedComponentIds.length < 2) {
            this.dm.updateComponent(this.props.sessionId, newComponent.getDatabaseObject());
            newComponentsList = this.state.components
                .filter(c => c.getId() !== newComponent.getId()).concat([newComponent])
        }
        else {
            newComponentsList = this.state.components.map(c => {
                if (c.getId() === newComponent.getId()) {
                    return newComponent;
                }
                else if (this.state.selectedComponentIds.includes(c.getId())) {
                    const oldX = c.getData().x as number;
                    const oldY = c.getData().y as number;
                    if (!oldX || !oldY) {
                        return c;
                    }
                    else {
                        return c.withData({ ...c.getData(), x: oldX + xDiff, y: oldY + yDiff });
                    }
                }
                else {
                    return c;
                }
            });
        }

        newComponentsList.forEach(c =>
            this.dm.updateComponent(this.props.sessionId, c.getDatabaseObject())
        );
        this.setState({ ...this.state, components: newComponentsList });
    }

    private setSelected(selectedComponentIds: string[]): void {
        this.setState({ ...this.state, selectedComponentIds });
    }

    private createUiComponent(dbComponent: schema.FirebaseDataComponent<any>): ComponentUiData {
        switch (dbComponent.getType()) {
            case schema.ComponentType.STOCK:
                return new StockUiData(dbComponent);
            case schema.ComponentType.FLOW:
                return new FlowUiData(dbComponent);
            case schema.ComponentType.CONNECTION:
                return new ConnectionUiData(dbComponent);
            case schema.ComponentType.PARAMETER:
                return new ParameterUiData(dbComponent);
            case schema.ComponentType.SUM_VARIABLE:
                return new SumVariableUiData(dbComponent);
            case schema.ComponentType.VARIABLE:
                return new DynamicVariableUiData(dbComponent);
            case schema.ComponentType.CLOUD:
                return new CloudUiData(dbComponent);
            case schema.ComponentType.STATIC_MODEL:
                return new StaticModelUiData(dbComponent);
        }
    }

    private downloadData(blob: Blob): void {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = "ModelResults.png";
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    private saveModel(): void {
        this.setState({ showingSaveModelBox: true });
    }

    private getAllComponentsIncludingChildren(): ComponentUiData[] {
        return this.state.components.concat(
            ...this.state.components
                .filter(c => c.getType() === schema.ComponentType.STATIC_MODEL)
                .map(c => (c as StaticModelUiData).getComponents())
        );
    }

    private identifyStocks(outStock: StockUiData, inStock: StockUiData) {
        const pointersToOutStock = this.getComponentsPointingTo(outStock);
        const pointersFromOutStock = this.getComponentsPointingFrom(outStock);

        const updatedComponents = this.state.components
            .filter(c => c.getId() !== outStock.getId())
            .map(
                c => {
                    if (pointersToOutStock.find(p => p.getId() === c.getId())) {
                        return c.withData({ ...c.getData(), to: inStock.getId() });
                    }
                    else if (pointersFromOutStock.find(p => p.getId() === c.getId())) {
                        return c.withData({ ...c.getData(), from: inStock.getId() });
                    }
                    else {
                        return c;
                    }
                }
            );
        this.setState({ ...this.state, components: updatedComponents });
        this.props.firebaseDataModel.setAllComponents(this.props.sessionId, updatedComponents);
    }

    public getComponentsPointingTo(component: ComponentUiData): PointerComponent<any, any, any, any>[] {
        return this.state.components.filter(p =>
            (p.getType() === schema.ComponentType.FLOW || p.getType() === schema.ComponentType.CONNECTION)
            && p.getData().to === component.getId()
        ).map(p => p.getType() === schema.ComponentType.FLOW ? p as FlowUiData : p as ConnectionUiData);
    }

    public getComponentsPointingFrom(component: ComponentUiData): PointerComponent<any, any, any, any>[] {
        return this.state.components.filter(p =>
            (p.getType() === schema.ComponentType.FLOW || p.getType() === schema.ComponentType.CONNECTION)
            && p.getData().from === component.getId()
        ).map(p => p.getType() === schema.ComponentType.FLOW ? p as FlowUiData : p as ConnectionUiData);
    }
}
