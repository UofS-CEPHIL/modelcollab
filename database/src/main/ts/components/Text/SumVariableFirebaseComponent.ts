import ComponentType from "../../ComponentType";
import TextComponentData from "./TextComponentData";
import TextFirebaseComponent from "./TextFirebaseComponent";

export default class SumVariableFirebaseComponent extends TextFirebaseComponent<TextComponentData> {
    public getType(): ComponentType {
        return ComponentType.SUM_VARIABLE;
    }

    public withData(d: TextComponentData): SumVariableFirebaseComponent {
        return new SumVariableFirebaseComponent(this.getId(), d);
    }
} 
