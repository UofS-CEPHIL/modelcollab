import { spawn } from "node:child_process";

import { FirebaseComponentModel as data } from "database/build/export";

import generateJulia from "./compute/JuliaGenerator";
import applicationConfig from "./config/applicationConfig";

export default class ComputeModelTask {

    private readonly components: data.FirebaseDataComponent[];
    private readonly parameters: data.ParametersFirebaseComponent;

    constructor(components: data.FirebaseDataComponent[]) {
        this.parameters = components.find(
            (c: data.FirebaseDataComponent) => c.getType() === data.ComponentType.PARAMETERS
        ) as data.ParametersFirebaseComponent;
        this.components = components.filter(
            (c: data.FirebaseDataComponent) => c.getType() !== data.ComponentType.PARAMETERS
        );
    }

    async start(): Promise<void> {
        const juliaCode: string = generateJulia(this.components, this.parameters);
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
