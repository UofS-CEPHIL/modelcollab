import { JuliaNameValueComponent } from "./JuliaComponentData";

export default class JuliaParameterComponent extends JuliaNameValueComponent {

    public getTranslatedValue(): string {
        return this.value;
    }

}
