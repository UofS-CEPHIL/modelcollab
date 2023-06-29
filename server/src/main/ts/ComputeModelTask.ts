import { FirebaseComponentModel as schema } from "database/build/export";
import axios from 'axios'

import JuliaGenerator from "./compute/JuliaGenerator";
import applicationConfig from "./config/applicationConfig";
import JuliaComponentDataBuilder from "./compute/JuliaComponentDataBuilder";


export default class ComputeModelTask {

    private readonly components: schema.FirebaseDataComponent<any>[];
    private readonly staticComponents: { [id: string]: schema.FirebaseDataComponent<any>[] };
    private readonly scenarioName: string;

    public constructor(
        components: schema.FirebaseDataComponent<any>[],
        staticComponents: { [id: string]: schema.FirebaseDataComponent<any>[] },
        scenarioName: string
    ) {
        this.components = components;
        this.staticComponents = staticComponents;
        this.scenarioName = scenarioName;
    }

    public async start(onResultsReady?: (path: string) => void, onFailed?: (reason: any) => void): Promise<void> {
        const date: string = new Date().toISOString().slice(0, 16);
        const filename: string = `/tmp/ModelResults_${date}.png`;
        var juliaCode: string;
        try {
            const models = JuliaComponentDataBuilder.makeStockFlowModels(
                this.components,
                this.staticComponents,
                this.scenarioName
            );
            const identifications = JuliaComponentDataBuilder.makeIdentifications(
                this.components,
                this.staticComponents
            );

            juliaCode = JuliaGenerator.generateJulia(
                models,
                identifications,
                filename
            )

            console.log(juliaCode);

            axios.post("http://localhost:8088/run", juliaCode)
                .then(_ => { if (onResultsReady) onResultsReady(filename) })
                .catch(e => { if (onFailed) onFailed(e) });

        }
        catch (e) {
            console.error(e);
            juliaCode = "";
        }
    }
}
