import JuliaComponentData from "./JuliaComponentData";

export default class JuliaStaticModelComponent extends JuliaComponentData {

    public readonly innerComponents: JuliaComponentData[];

    public constructor(
        name: string,
        firebaseId: string,
        innerComponents: JuliaComponentData[]
    ) {
        super(name, firebaseId);
        this.innerComponents = innerComponents;
    }
}
