import { spawn } from "node:child_process";

import { FirebaseDataComponent } from "database/build/data/FirebaseComponentModel";

import generateJulia from "./compute/JuliaGenerator";

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
        // const juliaCode: string = generateJulia(this.components, this.parameters);
        const juliaCode: string = "2 + 2";
        const proc = spawn("julia", ["pipe", "inherit", "inherit"]);
        proc.stdin.write(juliaCode);
        proc.stdin.write("\n");
        proc.stdin.write("\\q \n");
        proc.stdin.end();
    }

}
