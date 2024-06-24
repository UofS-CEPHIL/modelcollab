import ComponentType from "./ComponentType";
import FirebaseComponent, { FirebaseComponentBase } from "./FirebaseComponent";
import FirebaseFlow from "./FirebaseFlow";
import FirebasePointComponent, {
    FirebasePointData
} from "./FirebasePointComponent";
import FirebasePointerComponent from "./FirebasePointerComponent";

export interface FirebaseStaticModelData extends FirebasePointData {
    x: number,
    y: number,
    color: string,
    modelId: string
}

// TODO we should somehow merge this with LoadedStaticModel, or at least
// come up with a better-defined way for them to interact
export default class FirebaseStaticModel
    extends FirebasePointComponent<FirebaseStaticModelData>
{

    public getType(): ComponentType {
        return ComponentType.STATIC_MODEL;
    }

    public withData(
        data: FirebaseStaticModelData
    ): FirebaseStaticModel {
        return new FirebaseStaticModel(this.getId(), data);
    }

    public getReadableComponentName(): string {
        return `Static Model ${this.getData().color} (#{this.getId()})`;
    }

    public withId(id: string): FirebaseStaticModel {
        return new FirebaseStaticModel(
            id,
            Object.assign({}, this.getData())
        );
    }

    public getLabel(): string | null {
        return null;
    }

    public makeChildId(id: string): string {
        return FirebaseStaticModel.makeChildIdFor(this.getId(), id);
    }

    public isChildId(id: string): boolean {
        return FirebaseStaticModel.isChildIdFor(this.getId(), id);
    }

    public makeChildren(
        cpts: FirebaseComponent[],
        padding: number = 0
    ): FirebaseComponent[] {
        const { dx, dy } = FirebaseStaticModel.getChildTranslations(
            cpts,
            padding
        );
        return cpts.map(c => c.asChildOf(this, dx, dy));
    }

    public static getChildTranslations(
        children: FirebaseComponent[],
        padding: number = 0
    ): { dx: number, dy: number } {
        return {
            dx: Math.min(...children.map(
                c => c.getData().x ?? Number.POSITIVE_INFINITY
            )) - padding,
            dy: Math.min(...children.map(
                c => c.getData().y ?? Number.POSITIVE_INFINITY
            )) - padding
        };
    }

    public static getParentModelId(id: string): string {
        return id.split(FirebaseComponentBase.ID_DELIMITER)[0];
    }

    public static isStaticModelChildId(id: string): boolean {
        return id.includes(FirebaseComponentBase.ID_DELIMITER);
    }

    public static isChildIdFor(staticModelId: string, childId: string): boolean {
        return childId.startsWith(
            staticModelId + FirebaseComponentBase.ID_DELIMITER
        );
    }

    public static makeChildIdFor(
        staticModelId: string,
        childId: string
    ): string {
        return staticModelId + FirebaseComponentBase.ID_DELIMITER + childId;
    }

    public static toStaticModelComponentData(d: any): FirebaseStaticModelData {
        return {
            x: Number(d.x),
            y: Number(d.y),
            modelId: String(d.modelId),
            color: String(d.color ?? "gray")
        };
    }
}
