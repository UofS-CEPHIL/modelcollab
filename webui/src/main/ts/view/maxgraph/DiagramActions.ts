import { Cell, EventObject, InternalEvent, Point } from "@maxgraph/core";
import FirebaseComponent, { FirebaseComponentBase } from "../../data/components/FirebaseComponent";
import FirebasePointComponent from "../../data/components/FirebasePointComponent";
import FirebaseDataModel from '../../data/FirebaseDataModel';
import MCGraph from "./MCGraph";
import ComponentPresentation from "./presentation/ComponentPresentation";
import UserActionLogger from "../../logging/UserActionLogger";
import FirebasePointerComponent from "../../data/components/FirebasePointerComponent";
import MCEdgeHandler from "./MCEdgeHandler";
import FirebaseFlow from "../../data/components/FirebaseFlow";
import FirebaseMovableLabelPointerComponent from "../../data/components/FirebaseMovableLabelPointerComponent";
import FirebaseStaticModel from "../../data/components/FirebaseStaticModel";

// This class contains the logic for making changes to the diagram, including
// the positions of the components and their values. This happens either by
// simply updating the database and allowing the change to propagate through the
// database listeners, or by listening for direct actions on the graph
// (e.g. moving a component with the mouse) and updating the database
// accordingly.
//
// TODO untangle this class, MCGraph, and UserControls. Kinda spaghetti.
export default abstract class DiagramActions<G extends MCGraph> {

    protected firebaseDataModel: FirebaseDataModel;
    protected graph: G;
    protected modelUuid: string;
    protected getCurrentComponents: () => FirebaseComponent[];
    protected actionLogger?: UserActionLogger;
    protected presentation: ComponentPresentation<FirebaseComponent>;

    public constructor(
        fbData: FirebaseDataModel,
        presentation: ComponentPresentation<FirebaseComponent>,
        graph: G,
        modelUuid: string,
        getCurrentComponents: () => FirebaseComponent[],
        actionLogger?: UserActionLogger,
    ) {
        this.firebaseDataModel = fbData;
        this.presentation = presentation;
        this.graph = graph;
        this.modelUuid = modelUuid;
        this.getCurrentComponents = getCurrentComponents;
        this.actionLogger = actionLogger;

        // Listen for graph actions and update Firebase when they happen. This
        // is only for actions that don't originate from "UserControls" and
        // instead come from the graph directly, such as cells moved or resized.
        this.graph.addListener(
            InternalEvent.CELLS_MOVED,
            (s: EventSource, o: EventObject) => this.onCellsMoved(s, o)
        );
        this.graph.addListener(
            InternalEvent.CELLS_RESIZED,
            (s: EventSource, o: EventObject) => this.onCellsResized(s, o)
        );
        this.graph.addListener(
            MCEdgeHandler.EDGE_POINTS,
            (s: EventSource, o: EventObject) => this.onCellPointsEdited(s, o)
        );

        this.graph.addListener(
            InternalEvent.LABEL_CHANGED,
            (_: EventSource, o: EventObject) => {
                if (this.actionLogger) {
                    const name = o.getProperty("cell")
                        .getValue()
                        .getReadableComponentName();
                    this.actionLogger.logAction(
                        "Label Changed",
                        `"${o.getProperty("value")}" (${name})`
                    );
                }
            }
        );
    }

    public async addComponent(
        component: FirebaseComponent,
        startEditing: boolean = true
    ): Promise<void> {
        // "update" and "add" are the same thing in Firebase
        this.updateComponent(component);
        setTimeout(() => {
            const cell = this.graph.getCellWithId(component.getId()) ?? null;
            if (cell && cell.getStyle().editable && startEditing) {
                this.graph.startEditingAtCell(cell);
            }
        });
        if (this.actionLogger) {
            this.actionLogger.logAction(
                "Component added",
                component.getReadableComponentName()
            );
        }
    }

    /**
     * Update the component in Firebase to match the given component. If a
     * cell is given, update Firebase to match the cell.
     */
    public async updateComponent(
        component: FirebaseComponent | Cell
    ): Promise<void> {
        if (component instanceof Cell) {
            if (component.getValue() instanceof FirebaseComponentBase) {
                component = this.presentation.updateComponent(
                    component.getValue(),
                    component,
                    this.graph
                );
            }
            else {
                console.warn("Called update component on unexpected cell: ");
                console.warn(component);
                return;
            }
        }

        if (FirebaseStaticModel.isStaticModelChildId(component.getId())) {
            await this.updateInnerComponent(component);
        }
        else {
            await this.firebaseDataModel.updateComponent(
                this.modelUuid,
                component
            );
        }

        if (this.actionLogger) {
            this.actionLogger.logAction(
                "Component updated",
                component.getReadableComponentName()
            );
        }
    }

    protected async updateInnerComponent(cpt: FirebaseComponent): Promise<void> {

        // TODO implement this properly

        // TODO this is wasteful and bad. Design it better.
        // const staticModelCptId = cpt.getContainingModelId();
        // if (!staticModelCptId)
        //     throw new Error("Expected inner component: " + cpt.getId());

        // const model = this.getComponentWithId(staticModelCptId);
        // if (!model) {
        //     throw new Error("Can't find model with id " + staticModelCptId);
        // }
        // else if (model.getType() !== ComponentType.STATIC_MODEL) {
        //     throw new Error(
        //         "Component was not a static model: " + staticModelCptId
        //     );
        // }

        // const disallowedFields = ["to", "from"];
        // const overrides = Object.fromEntries(
        //     Object.entries(model.getData())
        //         .filter(([k, _]) => !disallowedFields.includes(k))
        // ) as ComponentPropertyOverrides;

        // this.firebaseDataModel.addComponentOverride(
        //     this.modelUuid,
        //     model.getId(),
        //     cpt.getUnqualifiedId(),
        //     overrides
        // );
    }

    public deleteSelection(): void {
        var selectedCells = this.graph!.getSelectionCells();
        if (selectedCells.length > 0) {
            const selectedIds = selectedCells
                .map(c => c.getId()!)
                .map(id =>
                    FirebaseFlow.isCloudId(id)
                        ? FirebaseFlow.getFlowIdFromCloudId(id)
                        : id
                );
            const allComponents = this.getCurrentComponents();
            const orphans = this.findOrphanedArrowIds(
                selectedIds,
                allComponents
            );
            this.firebaseDataModel.removeComponents(
                this.modelUuid,
                [...selectedIds, ...orphans],
                allComponents
            );

            if (this.actionLogger) {
                this.actionLogger.logAction(
                    "Delete selection",
                    selectedCells.map(c =>
                        c.getValue().getReadableComponentName()
                    ).join(',')
                );
            }
        }
    }

    public deleteComponent(
        component: FirebaseComponent | string
    ): void {
        if (component instanceof FirebaseComponentBase<any>) {
            component = component.getId();
        }
        const allComponents = this.getCurrentComponents();
        const orphans = this.findOrphanedArrowIds(
            [component],
            allComponents
        );
        this.firebaseDataModel.removeComponents(
            this.modelUuid,
            [component, ...orphans],
            allComponents
        );

        if (this.actionLogger) {
            this.actionLogger.logAction(
                "Delete component",
                this.getCurrentComponents()
                    .find(c => c.getId() === component)
                    ?.getReadableComponentName()
            );
        }
    }

    protected onCellsMoved(_: EventSource, event: EventObject): void {
        const dx = event.properties["dx"];
        const dy = event.properties["dy"];
        const cells: Cell[] = event.properties["cells"];
        const updatedComponents = cells
            .map(c => c.getId()!)
            .map(id => this.getComponentWithIdOrThrow(id));


        const allComponents = this.getCurrentComponents();
        const verticesToUpdate = updatedComponents.filter(
            c => c instanceof FirebasePointComponent
        );

        const others = allComponents.filter(
            c => !verticesToUpdate.find(v => v.getId() === c.getId())
        );
        const updatedVertices = verticesToUpdate.map(v =>
            (v as FirebasePointComponent<any>)
                .withUpdatedLocation(dx, dy)
        );
        this.firebaseDataModel.setAllComponents(
            this.modelUuid,
            [...updatedVertices, ...others]
        );

        if (this.actionLogger) {
            this.actionLogger.logAction(
                "Move cells",
                updatedVertices
                    .map(u =>
                        `${u.getReadableComponentName()}: `
                        + `${u.getData().x} ${u.getData().y}`
                    ).join(',')
            );
        }
    }

    protected onCellsResized(_: EventSource, event: EventObject): void {
        const cells: Cell[] = event.properties["cells"];
        const allComponents = this.getCurrentComponents();
        const updated = cells.map(c =>
            this.presentation.updateComponent(
                c.getValue() as FirebaseComponent,
                c,
                this.graph
            )
        );
        const others = allComponents.filter(
            c => !updated.find(v => v.getId() === c.getId())
        );
        this.firebaseDataModel.setAllComponents(
            this.modelUuid,
            [...updated, ...others]
        );

        if (this.actionLogger) {
            this.actionLogger.logAction(
                "Resize cells",
                updated
                    .map(u =>
                        `${u.getReadableComponentName()}: `
                        + `${u.getData().width}w ${u.getData().height}h`
                    ).join(',')
            );
        }
    }

    protected onCellPointsEdited(_: EventSource, event: EventObject): void {
        const points: Point[] = event.getProperty("points") ?? [];
        const cell: Cell = event.getProperty("cell");
        const entryX: number = event.getProperty("entryX");
        const entryY: number = event.getProperty("entryY");
        const exitX: number = event.getProperty("exitX");
        const exitY: number = event.getProperty("exitY");
        const labelX: number = event.getProperty("labelX");
        const labelY: number = event.getProperty("labelY");

        if (cell.getValue() instanceof FirebasePointerComponent) {
            var component: FirebasePointerComponent<any> = cell.getValue();
            if (!component.pointsEqual(points, entryX, entryY, exitX, exitY)) {
                component = cell.getValue()
                    .withPoints(points, entryX, entryY, exitX, exitY)

                if (this.actionLogger) {
                    this.actionLogger.logAction(
                        "Bend arrow",
                        cell.getValue().getReadableComponentName()
                    );
                }
            }
            if (
                component instanceof FirebaseMovableLabelPointerComponent
                && !component.labelPositionEqual(labelX, labelY)
            ) {
                component = component.withLabelPosition(labelX, labelY);
                if (this.actionLogger) {
                    this.actionLogger.logAction(
                        "Move label",
                        cell.getValue().getReadableComponentName()
                    );
                }
            }

            // Only update if we did anything above
            // @ts-ignore we actually want != in this case
            if (component != cell.getValue()) {
                this.updateComponent(component);
            }
        }
    }

    protected getComponentWithId(
        id: string,
        currentComponents?: FirebaseComponent[]
    ): FirebaseComponent | undefined {
        if (!currentComponents) currentComponents = this.getCurrentComponents();
        return currentComponents.find(c => c.getId() === id);
    }

    protected getComponentWithIdOrThrow(
        id: string,
        currentComponents?: FirebaseComponent[]
    ): FirebaseComponent {
        const ret = this.getComponentWithId(id, currentComponents);
        if (!ret) throw new Error("Can't find component with id " + id);
        return ret;
    }

    protected findOrphanedArrowIds(
        deletedIds: string[],
        allComponents: FirebaseComponent[]
    ): string[] {
        function isOrphaned(c: FirebaseComponent): boolean {

            return (c.getData().from && deletedIds.includes(c.getData().from))
                || (c.getData().to && deletedIds.includes(c.getData().to));
        }

        return allComponents
            .filter(isOrphaned)
            .map(c => c.getId());
    }

    /**
     * @param replacedComponent: The component that will be removed and replaced
     * @param replacementComponent: The component that will remain on screen and
     * have the other component's arrows redirected toward it.
     */
    public identifyComponents(
        replacedComponent: FirebaseComponent,
        replacementComponent: FirebaseComponent
    ): void {
        this.firebaseDataModel.identifyComponents(
            this.modelUuid,
            replacedComponent.getId(),
            replacementComponent.getId(),
        );

        if (this.actionLogger) {
            this.actionLogger.logAction(
                "identify",
                `replaced ${replacedComponent.getReadableComponentName()} with `
                + `${replacementComponent.getReadableComponentName()}`
            );
        }
    }
}
