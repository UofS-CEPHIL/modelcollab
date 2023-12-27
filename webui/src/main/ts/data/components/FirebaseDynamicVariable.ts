import ComponentType from "./ComponentType";
import FirebaseTextComponent, {
    FirebaseNameValueData
} from "./FirebaseTextComponent";

export default class FirebaseDynamicVariable
    extends FirebaseTextComponent<FirebaseNameValueData>
{
    public getType(): ComponentType {
        return ComponentType.VARIABLE;
    }

    public withData(d: FirebaseNameValueData): FirebaseDynamicVariable {
        return new FirebaseDynamicVariable(this.getId(), d);
    }

    public withId(id: string): FirebaseDynamicVariable {
        return new FirebaseDynamicVariable(
            id,
            Object.assign({}, this.getData())
        );
    }
}
