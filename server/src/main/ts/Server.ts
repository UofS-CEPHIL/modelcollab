import express, { Express, Response } from "express";
import fs from "fs";
import cors from "cors";
import https from "https";
import http from "http";

import applicationConfig from "./config/applicationConfig";

import { FirebaseClient } from "./data/FirebaseClient";
import { FirebaseComponentModel as schema } from "database/build/export";
import JuliaGenerator from "./compute/JuliaGenerator";
import JuliaComponentDataBuilder from "./compute/JuliaComponentDataBuilder";
import ComputeModelTask from "./ComputeModelTask";

class Server {

    private readonly SUCCESS_CODE = 200;

    private readonly fbClient: FirebaseClient;

    private pendingResults: { [id: string]: string };

    public constructor() {
        this.fbClient = new FirebaseClient();
        this.pendingResults = {};
    }

    public serve(): void {
        const app: Express = express();
        app.use(cors());
        this.setupRoutes(app);
        applicationConfig.useHttp && this.createHttpServer(app);
        applicationConfig.useHttps && this.createHttpsServer(app);
    }

    private startServer(server: http.Server, port: number): void {
        try {
            server.on('error', console.error);
            server.listen(
                port,
                () => console.log(`Listening on port ${port}`)
            );
        }
        catch (e) {
            console.error(e);
        }
    }

    private createHttpServer(app: Express): void {
        const server = http.createServer(app);
        this.startServer(server, applicationConfig.httpPort);
    }

    private createHttpsServer(app: Express): void {
        const server = https.createServer(
            {
                key: fs.readFileSync(applicationConfig.httpsPrivKeyPath),
                cert: fs.readFileSync(applicationConfig.httpsCertPath),
                ca: fs.readFileSync(applicationConfig.httpsChainPath)
            },
            app
        );
        this.startServer(server, applicationConfig.httpsPort);
    }

    private setupRoutes(app: Express): void {
        app.get(
            "/getCode/:sessionId",
            (req, res) => this.getCode(req.params.sessionId, res)
        );
        app.post(
            "/computeModel/:sessionId",
            (req, res) => this.computeModel(req.params.sessionId, res)
        );
        app.get(
            "/getModelResults/:resultId",
            (req, res) => this.getModelResults(req.params.resultId, res)
        );
    }

    private async computeModel(sessionId: string, res: Response): Promise<void> {
        try {
            console.log("computeModel");
            const id = Math.floor(Math.random() * 1000).toString();
            const components: schema.FirebaseDataComponent<any>[] = await this.fbClient.getComponents(sessionId);
            new ComputeModelTask(components).start(p => this.pendingResults[id] = p);

            console.log("Started Julia task.");
            delete this.pendingResults[id];
            res.status(200).send(id);
        }
        catch (e) {
            console.error(e);
            res.status(500).send(e);
        }
    }

    private async getCode(sessionId: string, res: Response): Promise<void> {
        try {
            console.log("getCode");
            const components: schema.FirebaseDataComponent<any>[] = await this.fbClient.getComponents(sessionId);
            const juliaComponents = JuliaComponentDataBuilder.makeJuliaComponents(components);
            const code = new JuliaGenerator(juliaComponents).generateJulia("/your/path").replaceAll(/(\\s+)?;(\\s+)?/g, "\n");

            console.log("Sending code for session " + sessionId);
            console.log(code);
            res.status(this.SUCCESS_CODE).contentType("text/plain").send(code);
        }
        catch (e: any) {
            console.error(e);
            res.status(this.SUCCESS_CODE).contentType("text/plain").send("Error: " + e.message);
        }
    }

    private async getModelResults(resultId: string, res: Response) {
        console.log("getModelResults: " + resultId);
        let resultPath: string | undefined = this.pendingResults[resultId];
        if (resultPath) {
            console.log(resultPath)
            if (fs.existsSync(resultPath))
                res.download(resultPath);
            else
                res.sendStatus(500);
        }
        else {
            res.sendStatus(204);
        }
    }
}

export default Server;
