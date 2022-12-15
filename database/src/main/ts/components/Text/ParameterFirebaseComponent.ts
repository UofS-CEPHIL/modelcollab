import ComponentType from "../../ComponentType";
import NameValueComponentData from "./NameValueComponentData";
import TextFirebaseComponent from "./TextFirebaseComponent";

export default class ParameterFirebaseComponent extends TextFirebaseComponent<NameValueComponentData> {
    public getType(): ComponentType {
        return ComponentType.PARAMETER;
    }

    public withData(d: NameValueComponentData): ParameterFirebaseComponent {
        return new ParameterFirebaseComponent(this.getId(), d);
    }
}

