import JuliaComponentData from "./JuliaComponentData";

export default class JuliaStaticModelComponent extends JuliaComponentData {

    public readonly innerComponents: JuliaComponentData[];

    public constructor(name: string, innerComponents: JuliaComponentData[]) {
        super(name);
        this.innerComponents = innerComponents;
    }
}
