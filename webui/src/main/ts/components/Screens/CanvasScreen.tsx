import React, { ReactElement } from 'react';

import { FirebaseComponentModel as schema } from "database/build/export";

import ComponentUiData, { PointerComponent } from '../Canvas/ScreenObjects/ComponentUiData';
import { Props as CanvasProps } from "../Canvas/BaseCanvas";
import { Props as ToolbarProps } from '../Toolbar/CanvasScreenToolbar';
import { UiMode } from '../../UiMode';
import applicationConfig from '../../config/applicationConfig';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { Props as EditBoxProps } from "../EditBox/EditBox";
import { Props as SaveModelBoxProps } from "../SaveModelBox/SaveModelBox";
//import { Props as ImportModelBoxProps } from "../ImportModelBox/ImportModelBox";
import { Props as ImportModelBoxProps } from "../ButtonListBox/ButtonListBox";
import ScenariosBox, { Props as ScenarioBoxProps } from "../ScenariosBox/ScenariosBox";
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
import SubstitutionUiData from '../Canvas/ScreenObjects/Substitution/SubstitionUiData';
import ScenarioUiData from '../Canvas/ScreenObjects/Scenario/ScenarioUiData';
import { Props as ScenarioEditBoxProps } from '../EditBox/ScenarioEditBox';
import HelpBox from '../HelpBox/HelpBox';


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
    createEditBox: (props: EditBoxProps<any>) => ReactElement;
    createImportModelBox: (props: ImportModelBoxProps) => ReactElement;
    createSaveModelBox: (props: SaveModelBoxProps) => ReactElement;
    createScenariosBox: (props: ScenarioBoxProps) => ReactElement;
}

interface State {
    mode: UiMode,
    components: ComponentUiData[];
    loadedModels: LoadedStaticModel[];
    selectedScenarioName: string | null;  // null means all default values
    selectedComponentIds: string[];
    // TODO combine these into one entity
    showingSaveModelBox: boolean;
    showingImportModelBox: boolean;
    showingScenarioBox: boolean;
    showingHelpBox: boolean;
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
            selectedScenarioName: null,
            selectedComponentIds: [],
            showingSaveModelBox: false,
            showingImportModelBox: false,
            showingScenarioBox: false,
            showingHelpBox: false,
        };
        this.dm = props.firebaseDataModel;
        document.title = applicationConfig.appName;
    }

    public componentDidMount() {
        // This happens at mount instead of in constructor because
        // otherwise we end up trying to render the component before
        // it mounts and React gets upset
        this.dm.subscribeToSession(
            this.props.sessionId,
            (dbComponents: schema.FirebaseDataComponent<any>[]) => {
                // Load any static models that aren't already loaded
                dbComponents
                    .filter(c => c.getType() === schema.ComponentType.STATIC_MODEL)
                    .map(c => c as schema.StaticModelFirebaseComponent)
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
                    ).map(c => this.createUiComponent(c)) as ComponentUiData[];

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
            case schema.ComponentType.FLOW.toString(): return true;
            case schema.ComponentType.CONNECTION.toString(): return true;
            default: return false;
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
                        downloadData: (b, fname) => this.downloadData(b, fname),
                        firebaseDataModel: this.props.firebaseDataModel,
                        saveModel: () => this.saveModel(),
                        importModel: () => this.importModel(),
                        showScenarios: () => this.showScenarios(),
                        restClient: new RestClientImpl(),
                        showHelpBox: () => this.showHelpBox(),
                        selectedScenario: this.state.selectedScenarioName
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
                            identifyComponents: (replaced, replacement) =>
                                this.identifyComponents(replaced, replacement)
                        }
                    )
                }
                {
                    (selectedComponents.length === 1 && this.shouldShowEditBox() && selectedComponents[0]) &&
                    this.props.createEditBox({
                        initialComponent: selectedComponents[0].getDatabaseObject(),
                        handleCancel: () => this.setSelected([]),
                        handleSave: (comp: schema.FirebaseDataComponent<any>) => {
                            const newComponent = this.createUiComponent(comp);
                            if (newComponent) {
                                const components: ComponentUiData[] = this.state.components
                                    .filter(c => c.getId() !== comp.getId())
                                    .concat(newComponent);
                                this.setState({ ...this.state, components, selectedComponentIds: [] });
                            }

                            this.dm.updateComponent(this.props.sessionId, comp);
                        },
                        sessionId: this.props.sessionId,
                        db: this.props.firebaseDataModel
                    } as ScenarioEditBoxProps)
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
                {
                    this.state.showingImportModelBox &&
                    this.props.createImportModelBox({
                        handleCancel: () => this.setState({ ...this.state, showingImportModelBox: false }),
                        handleSubmit: name => {
                            setTimeout(() => this.setState({ ...this.state, showingImportModelBox: false }));
                            this.loadStaticModelData(name);
                        },
                        database: this.props.firebaseDataModel
                    })
                }
                {
                    this.state.showingScenarioBox &&
                    this.props.createScenariosBox({
                        handleCancel: () => this.setState({ ...this.state, showingScenarioBox: false }),
                        handleSubmit: name => this.setState({ ...this.state, showingScenarioBox: false, selectedScenarioName: name }),
                        initialSelected: this.state.selectedScenarioName,
                        sessionId: this.props.sessionId,
                        database: this.props.firebaseDataModel,
                        handleEdit: name => this.startEditingScenario(name),
                        generateNewId: () => IdGenerator.generateUniqueId(this.state.components)
                    })
                }
                {
                    this.state.showingHelpBox &&
                    (<HelpBox onClose={() => this.setState({ ...this.state, showingHelpBox: false })} width={700} />)
                }
            </React.Fragment >
        );
    }
    private showHelpBox(): void {
        this.setState({ ...this.state, showingHelpBox: true });
    }

    private startEditingScenario(name: string): void {
        setTimeout(() => this.setState({ ...this.state, mode: UiMode.EDIT }));
        setTimeout(() => {
            const scenario = this.state.components
                .filter(c => c.getType() === schema.ComponentType.SCENARIO)
                .find(c => c.getData().name === name);
            if (!scenario) throw new Error("Cannot find scenario for editing: " + name);
            setTimeout(() => this.setSelected([scenario.getId()]));
        }, 100);
    }

    private setComponentsForStaticModels(): void {
        this.state.components
            .filter(c => c.getType() === schema.ComponentType.STATIC_MODEL)
            .forEach(c => {
                let loadedModel = this.state.loadedModels.find(m => m.modelId === c.getData().modelId);
                if (loadedModel) {
                    const modelUiData = c as StaticModelUiData;
                    modelUiData.setComponents(loadedModel.components);
                    modelUiData.qualifyComponentIds();
                }
            });
    }


    private shouldShowEditBox(): boolean {
        function isEditableComponent(c?: schema.ComponentType): boolean {
            if (!c) return false;
            switch (c) {
                case schema.ComponentType.CLOUD:
                case schema.ComponentType.CONNECTION:
                case schema.ComponentType.SCENARIO:
                case schema.ComponentType.STATIC_MODEL:
                case schema.ComponentType.SUBSTITUTION:
                    return false;
                default:
                    return true;
            }
        }
        const selectedComponent = this.state.components.find(c => c.getId() === this.state.selectedComponentIds[0]);
        return this.state.mode === UiMode.EDIT
            && this.state.selectedComponentIds.length === 1
            && selectedComponent !== undefined
            && isEditableComponent(selectedComponent?.getType());
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
            // This is required to make React recognize the state change.
            // It just does this sometimes; not sure why.
            setTimeout(() => { this.setSelected([]) });
            this.dm.updateComponent(this.props.sessionId, newComponent.getDatabaseObject());
        }
    }

    private importStaticModel(modelId: string): void {
        this.dm.getComponentsForSavedModel(
            modelId,
            components => {
                if (this.state.loadedModels.find(m => m.modelId === modelId) === undefined) {
                    const newComponents = components.map(c => this.createUiComponent(c)) as ComponentUiData[];
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

    private importModel(): void {
        this.setState({ ...this.state, showingImportModelBox: true });
    }

    private showScenarios(): void {
        this.setState({ ...this.state, showingScenarioBox: true });
    }

    private loadStaticModelData(modelId: string): void {
        this.addComponent(
            new StaticModelUiData(
                new schema.StaticModelFirebaseComponent(
                    IdGenerator.generateUniqueId(this.state.components),
                    {
                        x: 0,
                        y: 0,
                        color: this.makeRandomStaticModelColour(),
                        modelId
                    }
                )
            )
        );
        this.importStaticModel(modelId);
    }

    private makeRandomStaticModelColour(): string {
        const colours = ["green", "blue", "yellow", "red", "purple", "gray", "orange"];
        const unusedIdx = colours
            .findIndex(colour =>
                !this.state.components.filter(c =>
                    c.getType() === schema.ComponentType.STATIC_MODEL
                ).find(sm => sm.getData().color === colour)
            );
        if (unusedIdx < 0) throw new Error("Unable to generate color");
        return colours[unusedIdx];
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
                    // eslint-disable-next-line                   
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
            case schema.ComponentType.SUBSTITUTION:
                return new SubstitutionUiData(dbComponent);
            case schema.ComponentType.SCENARIO:
                return new ScenarioUiData(dbComponent);
        }
    }

    private downloadData(blob: Blob, fileName: string): void {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = fileName;
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

    private identifyComponents(replaced: ComponentUiData, replacement: ComponentUiData) {
        // We have to setTimeout or else it doesn't register the updated state.
        // React is baffling to me sometimes.
        setTimeout(() => this.addComponent(new SubstitutionUiData(
            new schema.SubstitutionFirebaseComponent(
                IdGenerator.generateUniqueId(this.state.components),
                {
                    replacedId: replaced.getId(),
                    replacementId: replacement.getId()
                }
            )
        )));
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
