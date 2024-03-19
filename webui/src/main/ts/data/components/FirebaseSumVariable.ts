import ComponentType from "./ComponentType";
import FirebaseTextComponent, {
    FirebaseTextData
} from "./FirebaseTextComponent";

export default class FirebaseSumVariable
    extends FirebaseTextComponent<FirebaseTextData>
{
    public getType(): ComponentType {
        return ComponentType.SUM_VARIABLE;
    }

    public withData(d: FirebaseTextData): FirebaseSumVariable {
        return new FirebaseSumVariable(this.getId(), d);
    }

    public withId(id: string): FirebaseSumVariable {
        return new FirebaseSumVariable(id, Object.assign({}, this.getData()));
    }

    public static toSumVariableComponentData(d: any): FirebaseTextData {
        return FirebaseTextComponent.toTextComponentData(d);
    }
}
