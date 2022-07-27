import { spawn } from "node:child_process";

import { FirebaseComponentModel as schema } from "database/build/export";

import JuliaGenerator from "./compute/JuliaGenerator";
import applicationConfig from "./config/applicationConfig";

export default class ComputeModelTask {

    private readonly components: schema.FirebaseDataComponent<any>[];

    constructor(components: schema.FirebaseDataComponent<any>[]) {
        this.components = components;
    }

    async start(): Promise<void> {
        const juliaCode: string = new JuliaGenerator(this.components).generateJulia();
        console.log(juliaCode.split(';'));
        let proc = spawn(
            "julia",
            {
                stdio: ["pipe", "inherit", "inherit"],
                cwd: applicationConfig.algebraicStockFlowFilePath
            }
        );
        proc.stdin.write(juliaCode);
        proc.stdin.write("\n");
        proc.stdin.write("exit()\n");
        proc.stdin.end();
    }
}
