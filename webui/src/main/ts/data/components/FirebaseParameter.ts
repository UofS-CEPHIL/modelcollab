import ComponentType from "./ComponentType";
import FirebaseTextComponent, {
    FirebaseNameValueData
} from "./FirebaseTextComponent";

export default class FirebaseParameter
    extends FirebaseTextComponent<FirebaseNameValueData>
{
    public getType(): ComponentType {
        return ComponentType.PARAMETER;
    }

    public withData(d: FirebaseNameValueData): FirebaseParameter {
        return new FirebaseParameter(this.getId(), d);
    }

    public withId(id: string): FirebaseParameter {
        return new FirebaseParameter(id, Object.assign({}, this.getData()));
    }
}
