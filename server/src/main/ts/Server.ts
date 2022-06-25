import express from "express";

import applicationConfig from "./config/applicationConfig";


export default class Server {

    private components: object;
    private sessions: object;

    serve(): void {

        const app = express();

        // todo configure / subscribe to Firebase


        // todo routes

        app.listen(applicationConfig.port, () => {
            console.log("Server started.");
        });
    }
}
