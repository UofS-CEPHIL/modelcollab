import { spawn } from "node:child_process";
import FirebaseDataComponent from "database/build/FirebaseDataComponent";

import JuliaGenerator from "./compute/JuliaGenerator";
import JuliaComponentDataBuilder from "./compute/JuliaComponentDataBuilder";

export default class ComputeModelTask {

    private readonly components: FirebaseDataComponent<any>[];
    private readonly staticComponents: { [id: string]: FirebaseDataComponent<any>[] };
    private readonly scenarioName: string;

    public constructor(
        components: FirebaseDataComponent<any>[],
        staticComponents: { [id: string]: FirebaseDataComponent<any>[] },
        scenarioName: string
    ) {
        this.components = components;
        this.staticComponents = staticComponents;
        this.scenarioName = scenarioName;
    }

    public async start(onResultsReady?: (path: string) => void): Promise<void> {
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
        }
        catch (e) {
            console.error(e);
            juliaCode = "";
        }
        console.log(juliaCode);
        let proc = spawn(
            "julia",
            {
                stdio: ["pipe", "inherit", "inherit"],
                cwd: "/home/eric",
            }
        );

        proc.stdin.write('ENV["GKSwstype"] = "nul"; ');
        proc.stdin.write('println("running code"); ');
        proc.stdin.write(juliaCode);
        proc.stdin.write("\n");
        proc.stdin.write("exit()\n");
        proc.stdin.end();
        if (onResultsReady) proc.on("exit", () => onResultsReady(filename));

    }
}
