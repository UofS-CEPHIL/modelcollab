import { spawn } from "node:child_process";

import { FirebaseComponentModel as schema } from "database/build/export";

import JuliaGenerator from "./compute/JuliaGenerator";
import applicationConfig from "./config/applicationConfig";
import JuliaComponentDataBuilder from "./compute/JuliaComponentDataBuilder";


export default class ComputeModelTask {

    private readonly components: schema.FirebaseDataComponent<any>[];
    private readonly staticComponents: { [id: string]: schema.FirebaseDataComponent<any>[] };

    public constructor(
        components: schema.FirebaseDataComponent<any>[],
        staticComponents: { [id: string]: schema.FirebaseDataComponent<any>[] }
    ) {
        this.components = components;
        this.staticComponents = staticComponents;
    }

    public async start(onResultsReady?: (path: string) => void): Promise<void> {
        const date: string = new Date().toISOString().slice(0, 16);
        const filename: string = `./ModelResults_${date}.png`;
        var juliaCode: string;
        try {
            const juliaComponents = JuliaComponentDataBuilder.makeJuliaComponents(this.components, this.staticComponents);
            juliaCode = new JuliaGenerator(juliaComponents).generateJulia(filename);
        }
        catch (e) {
            console.error(e);
            juliaCode = "";
        }
        console.log(juliaCode.split(';'));
        let proc = spawn(
            "/home/ericr789/julia-1.7.3/bin/julia",
            {
                stdio: ["pipe", "inherit", "inherit"],
            }
        );
        proc.stdin.write('ENV["GKSwstype"] = "nul"; ');
        proc.stdin.write(juliaCode);
        proc.stdin.write("\n");
        proc.stdin.write("exit()\n");
        proc.stdin.end();
        if (onResultsReady) proc.on("exit", () => onResultsReady(filename));
    }
}
