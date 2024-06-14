import ComponentType from "./ComponentType";
import { FirebaseComponentBase } from "./FirebaseComponent";
import FirebasePointComponent, {
    FirebasePointData
} from "./FirebasePointComponent";

export interface FirebaseStaticModelData extends FirebasePointData {
    x: number,
    y: number,
    color: string,
    modelId: string
}

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
        return this.getId() + FirebaseComponentBase.ID_DELIMITER + id;
    }

    public isChildId(id: string): boolean {
        return FirebaseStaticModel.isChildIdFor(this.getId(), id);
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

    public static toStaticModelComponentData(d: any): FirebaseStaticModelData {
        return {
            x: Number(d.x),
            y: Number(d.y),
            modelId: String(d.modelId),
            color: String(d.color ?? "gray")
        };
    }
}
