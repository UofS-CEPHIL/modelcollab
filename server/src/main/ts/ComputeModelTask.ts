import { spawn } from "node:child_process";

import { FirebaseComponentModel as schema } from "database/build/export";

import JuliaGenerator from "./compute/JuliaGenerator";
import applicationConfig from "./config/applicationConfig";
import JuliaComponentDataBuilder from "./compute/JuliaComponentDataBuilder";


export default class ComputeModelTask {

    private readonly components: schema.FirebaseDataComponent<any>[];

    public constructor(components: schema.FirebaseDataComponent<any>[]) {
        this.components = components;
    }

    public async start(onResultsReady?: (path: string) => void): Promise<void> {
        const date: string = new Date().toISOString().slice(0, 16);
        const filename: string = `/tmp/ModelResults_${date}`;
        try {
            const juliaCode: string = new JuliaGenerator(JuliaComponentDataBuilder.makeJuliaComponents(this.components)).generateJulia(filename);
            console.log(juliaCode.split(';'));
            let proc = spawn(
                "julia",
                {
                    stdio: ["pipe", "inherit", "inherit"],
                    cwd: "/home/mc"
                }
            );
            proc.stdin.write('ENV["GKSwstype"] = "nul"\n');
            proc.stdin.write(juliaCode);
            proc.stdin.write("\n");
            proc.stdin.write("exit()\n");
            proc.stdin.end();
            if (onResultsReady)
                proc.on("exit", (code) => {
                    console.log("Process exited with code " + code);
                    onResultsReady(filename + ".png");
                });
        }
        catch (e) {
            console.error(e);
            if (onResultsReady) onResultsReady(filename);
        }
    }
}
