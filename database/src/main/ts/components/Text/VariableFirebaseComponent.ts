import ComponentType from "../../ComponentType";
import NameValueComponentData from "./NameValueComponentData";
import TextFirebaseComponent from "./TextFirebaseComponent";

export default class VariableFirebaseComponent extends TextFirebaseComponent<NameValueComponentData> {
    public getType(): ComponentType {
        return ComponentType.VARIABLE;
    }

    public withData(d: NameValueComponentData): VariableFirebaseComponent {
        return new VariableFirebaseComponent(this.getId(), d);
    }
} 
