import express, { Express } from "express";

import { FirebaseManager, FirebaseDataModel, FirebaseDataModelImpl, FirebaseComponentModel } from "database/build/export";
// import { FirebaseDataModel } from "database/build/data/FirebaseDataModel";
// import FirebaseDataModelImpl from "database/build/data/FirebaseDataModelImpl";
// import { createFirebaseDataComponent } from "database/build/data/FirebaseComponentModel";
import ComputeModelTask from "./ComputeModelTask";

class Server {

    private readonly PORT = 8999;
    private readonly SUCCESS_CODE = 200;

    private components: any;

    serve(): void {

        this.setupFirebase();

        console.log("starting task")
        new ComputeModelTask([], {}).start();

        // const app: Express = express();
        // this.setupRoutes(app);
        // app.listen(this.PORT, () => {
        //     console.log("Server started.");
        // });
    }

    private async setupFirebase(): Promise<void> {
        const firebaseManager: FirebaseManager = await FirebaseManager.create();
        firebaseManager.login();
        const firebaseDM: FirebaseDataModel = new FirebaseDataModelImpl(firebaseManager);
        firebaseDM.subscribeToAllComponents(
            (snapshot: any) => this.components = snapshot.val()
        );
    }

    private setupRoutes(app: Express) {
        app.post("/compute/:sessionId", (req, res) => {
            const createComponents = (cpts: any) =>
                Object.keys(cpts)
                    .map(k => FirebaseComponentModel.createFirebaseDataComponent(k, cpts[k]));

            const sessionId = req.params.sessionId;
            const componentObjs = createComponents(this.components[sessionId]);
            // todo finish this


            res.sendStatus(this.SUCCESS_CODE);
        });
    }
}

export default Server;
