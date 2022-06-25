import Server from "./Server";

export default class Main {
    async main() {
        const svr: Server = new Server();
        console.log("hi");
    }
}

await new Main().main(); 
