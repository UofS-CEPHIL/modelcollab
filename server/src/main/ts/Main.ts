import Server from "./Server";

export default class Main {
    main() {
        const server = new Server();
        server.serve();
    }
}

new Main().main(); 
