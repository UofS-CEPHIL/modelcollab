import React, { ReactElement } from 'react';
import ComponentUiData from '../Canvas/ScreenObjects/ComponentUiData';
import PointerComponent from "../Canvas/ScreenObjects/PointerComponent";
import { Props as CanvasProps } from "../Canvas/BaseCanvas";
import { Props as ToolbarProps } from '../Toolbar/CanvasScreenToolbar';
import { UiMode } from '../../UiMode';
import applicationConfig from '../../config/applicationConfig';
import FirebaseDataModel from '../../data/FirebaseDataModel';
import { Props as EditBoxProps } from "../EditBox/EditBox";
import { Props as SaveModelBoxProps } from "../SaveModelBox/SaveModelBox";
import { Props as ImportModelBoxProps } from "../ButtonListBox/ButtonListBox";
import { Props as ScenarioBoxProps } from "../ScenariosBox/ScenariosBox";
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
import ComponentType from 'database/build/ComponentType';
import StaticModelFirebaseComponent from 'database/build/components/StaticModel/StaticModelFirebaseComponent';
import FirebaseDataComponent from 'database/build/FirebaseDataComponent';
import SubstitutionFirebaseComponent from 'database/build/components/Substitution/SubstitutionFirebaseComponent';


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

enum BoxState {
    NONE = "NONE",
    SAVE_MODEL = "SAVE_MODEL",
    IMPORT_MODEL = "IMPORT_MODEL",
    SCENARIO = "SCENARIO",
    HELP = "HELP",
}

interface State {
    mode: UiMode,
    components: ComponentUiData[];
    loadedModels: LoadedStaticModel[];
    selectedScenarioName: string | null;  // null means all default values
    selectedComponentIds: string[];
    boxState: BoxState;
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
            boxState: BoxState.NONE
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
            (dbComponents: FirebaseDataComponent<any>[]) => {
                // Load any static models that aren't already loaded
                dbComponents
                    .filter(c => c.getType() === ComponentType.STATIC_MODEL)
                    .map(c => c as StaticModelFirebaseComponent)
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
                    .filter(c => c.getType() === ComponentType.FLOW)
                    .map(c => this.createUiComponent(c));

                const nonFlowPointerComponents: ComponentUiData[] = dbComponents
                    .filter(c =>
                        this.isPointerComponentType(c.getType())
                        && c.getType() !== ComponentType.FLOW
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
            case ComponentType.FLOW.toString(): return true;
            case ComponentType.CONNECTION.toString(): return true;
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
                        handleSave: (comp: FirebaseDataComponent<any>) => {
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
                    this.state.boxState === BoxState.SAVE_MODEL &&
                    this.props.createSaveModelBox({
                        handleCancel: () => this.setState({ ...this.state, boxState: BoxState.NONE }),
                        handleSave: id => {
                            this.setState({ ...this.state, boxState: BoxState.NONE });
                            this.dm.addModelToLibrary(id, this.state.components);
                        }
                    })
                }
                {
                    this.state.boxState === BoxState.IMPORT_MODEL &&
                    this.props.createImportModelBox({
                        handleCancel: () => this.setState({ ...this.state, boxState: BoxState.NONE }),
                        handleSubmit: name => {
                            setTimeout(() => this.setState({ ...this.state, boxState: BoxState.NONE }));
                            this.loadStaticModelData(name);
                        },
                        database: this.props.firebaseDataModel
                    })
                }
                {
                    this.state.boxState === BoxState.SCENARIO &&
                    this.props.createScenariosBox({
                        handleCancel: () => this.setState({ ...this.state, boxState: BoxState.NONE }),
                        handleSubmit: name => this.setState({ ...this.state, boxState: BoxState.NONE, selectedScenarioName: name }),
                        initialSelected: this.state.selectedScenarioName,
                        sessionId: this.props.sessionId,
                        database: this.props.firebaseDataModel,
                        handleEdit: name => this.startEditingScenario(name),
                        generateNewId: () => IdGenerator.generateUniqueId(this.state.components)
                    })
                }
                {
                    this.state.boxState === BoxState.HELP &&
                    (<HelpBox onClose={() => this.setState({ ...this.state, boxState: BoxState.NONE })} width={700} />)
                }
            </React.Fragment >
        );
    }
    private showHelpBox(): void {
        this.setState({ ...this.state, boxState: BoxState.HELP });
    }

    private startEditingScenario(name: string): void {
        setTimeout(() => this.setState({ ...this.state, mode: UiMode.EDIT }));
        setTimeout(() => {
            const scenario = this.state.components
                .filter(c => c.getType() === ComponentType.SCENARIO)
                .find(c => c.getData().name === name);
            if (!scenario) throw new Error("Cannot find scenario for editing: " + name);
            setTimeout(() => this.setSelected([scenario.getId()]));
        }, 100);
    }

    private setComponentsForStaticModels(): void {
        this.state.components
            .filter(c => c.getType() === ComponentType.STATIC_MODEL)
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
        return this.state.mode === UiMode.EDIT;
    }

    private addComponent(newComponent: ComponentUiData): void {
        if (!this.state.components.find(c => c.getId() === newComponent.getId())) {
            if (newComponent.getType() === ComponentType.STATIC_MODEL) {
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
        this.setState({ ...this.state, boxState: BoxState.IMPORT_MODEL });
    }

    private showScenarios(): void {
        this.setState({ ...this.state, boxState: BoxState.SCENARIO });
    }

    private loadStaticModelData(modelId: string): void {
        this.addComponent(
            new StaticModelUiData(
                new StaticModelFirebaseComponent(
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
                    c.getType() === ComponentType.STATIC_MODEL
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

    private createUiComponent(dbComponent: FirebaseDataComponent<any>): ComponentUiData {
        switch (dbComponent.getType()) {
            case ComponentType.STOCK:
                return new StockUiData(dbComponent);
            case ComponentType.FLOW:
                return new FlowUiData(dbComponent);
            case ComponentType.CONNECTION:
                return new ConnectionUiData(dbComponent);
            case ComponentType.PARAMETER:
                return new ParameterUiData(dbComponent);
            case ComponentType.SUM_VARIABLE:
                return new SumVariableUiData(dbComponent);
            case ComponentType.VARIABLE:
                return new DynamicVariableUiData(dbComponent);
            case ComponentType.CLOUD:
                return new CloudUiData(dbComponent);
            case ComponentType.STATIC_MODEL:
                return new StaticModelUiData(dbComponent);
            case ComponentType.SUBSTITUTION:
                return new SubstitutionUiData(dbComponent);
            case ComponentType.SCENARIO:
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
        this.setState({ boxState: BoxState.SAVE_MODEL });
    }

    private identifyComponents(replaced: ComponentUiData, replacement: ComponentUiData) {
        // We have to setTimeout or else it doesn't register the updated state.
        // React is baffling to me sometimes.
        setTimeout(() => this.addComponent(new SubstitutionUiData(
            new SubstitutionFirebaseComponent(
                IdGenerator.generateUniqueId(this.state.components),
                {
                    replacedId: replaced.getId(),
                    replacementId: replacement.getId()
                }
            )
        )));
    }

    public getComponentsPointingTo(component: ComponentUiData): PointerComponent[] {
        return this.state.components.filter(p =>
            (p.getType() === ComponentType.FLOW || p.getType() === ComponentType.CONNECTION)
            && p.getData().to === component.getId()
        ).map(p => p.getType() === ComponentType.FLOW ? p as FlowUiData : p as ConnectionUiData);
    }

    public getComponentsPointingFrom(component: ComponentUiData): PointerComponent[] {
        return this.state.components.filter(p =>
            (p.getType() === ComponentType.FLOW || p.getType() === ComponentType.CONNECTION)
            && p.getData().from === component.getId()
        ).map(p => p.getType() === ComponentType.FLOW ? p as FlowUiData : p as ConnectionUiData);
    }
}
