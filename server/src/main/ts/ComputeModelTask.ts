import { spawn } from "node:child_process";

import { FirebaseDataComponent } from "database/build/data/FirebaseComponentModel";

import generateJulia from "./compute/JuliaGenerator";
import applicationConfig from "./config/applicationConfig";

export default class ComputeModelTask {

    private readonly components: FirebaseDataComponent[];
    private readonly parameters: { [name: string]: string };

    constructor(
        components: FirebaseDataComponent[],
        parameters: { [name: string]: string }
    ) {
        this.components = components;
        this.parameters = parameters;
    }

    async start(): Promise<void> {
        const juliaCode: string = generateJulia(this.components, this.parameters);
        console.log(juliaCode);
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
