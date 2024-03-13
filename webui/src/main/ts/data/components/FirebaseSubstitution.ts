import ComponentType from "./ComponentType";
import { FirebaseDataObject, FirebaseEntityBase } from "./FirebaseComponent";

export interface SubstitutionComponentData extends FirebaseDataObject {
    replacedId: string,
    replacementId: string
}

export class FirebaseSubstitution
    extends FirebaseEntityBase<SubstitutionComponentData>
{

    public getType(): ComponentType {
        return ComponentType.SUBSTITUTION;
    }

    public withData(
        data: SubstitutionComponentData
    ): FirebaseSubstitution {
        return new FirebaseSubstitution(this.getId(), data);
    }

    public withId(id: string): FirebaseSubstitution {
        return new FirebaseSubstitution(
            id,
            Object.assign({}, this.getData())
        );
    }

    public toFirebaseEntry(): [string, string] {
        return [this.getData().replacedId, this.getData().replacementId];
    }
}
