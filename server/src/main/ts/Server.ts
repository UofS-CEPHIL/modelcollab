import express, { Express } from "express";

import {
    FirebaseManager,
    FirebaseDataModel,
    FirebaseDataModelImpl,
    FirebaseComponentModel
} from "database/build/export";
import ComputeModelTask from "./ComputeModelTask";
import { FirebaseDataComponent } from "database/build/data/FirebaseComponentModel";

class Server {

    private readonly PORT = 8999;
    private readonly SUCCESS_CODE = 200;

    private serverStarted: boolean = false;
    private components: any;

    serve(): void {
        FirebaseManager.create().then((m: FirebaseManager) => this.startServer(m));
    }

    private startServer(firebaseManager: FirebaseManager): void {
        const authChangedCallback = (isSignedIn: boolean) => {
            if (this.serverStarted) {
                throw new Error("auth changed after server started");
            }
            if (!isSignedIn) {
                throw new Error("signed out");
            }
            const firebaseDM: FirebaseDataModel = new FirebaseDataModelImpl(firebaseManager);
            firebaseDM.subscribeToAllComponents(
                (snapshot: any) => this.components = snapshot.val()
            );
            this.serverMain();
        };
        firebaseManager.registerAuthChangedCallback(authChangedCallback);
        firebaseManager.login();
    }

    private serverMain(): void {
        if (this.serverStarted) {
            throw new Error("called serverMain after server already started");
        }
        this.serverStarted = true;
        console.log("Server started!");



        const S_STOCK_NAME = "S";
        const S_STARTING_VALUE = "38010000.0";
        const E_STOCK_NAME = "E";
        const E_STARTING_VALUE = "0.0";
        const I_STOCK_NAME = "I";
        const I_STARTING_VALUE = "1.0"
        const R_STOCK_NAME = "R";
        const R_STARTING_VALUE = "0.0";
        const HICU_STOCK_NAME = "HICU";
        const HICU_STARTING_VALUE = "0.0";
        const HNICU_STOCK_NAME = "HNICU";
        const HNICU_STARTING_VALUE = "0.0";
        const NEWINC_FLOW_NAME = "newIncidence";
        const NEWINC_EQUATION = "p.B*u.S*u.I/p.N";
        const NEWINF_FLOW_NAME = "newInfectious";
        const NEWINF_EQUATION = "u.E*p.ri";
        const NEWREC_FLOW_NAME = "newRecovery";
        const NEWREC_EQUATION = "u.I/p.tr * (1.0 - p.fH)";
        const WANIMM_FLOW_NAME = "waningImmunity";
        const WANIMM_EQUATION = "u.R/p.tw";
        const HICUAD_FLOW_NAME = "hicuAdmission";
        const HICUAD_EQUATION = "u.I/p.tr * p.fH * p.fICU";
        const HNICUA_FLOW_NAME = "hnicuAdmission";
        const HNICUA_EQUATION = "u.I/p.tr * p.fH * (1.0-p.fICU)";
        const OUTICU_FLOW_NAME = "outICU";
        const OUTICU_EQUATION = "u.HICU/p.tICU";
        const RECOVH_FLOW_NAME = "recoveryH";
        const RECOVH_EQUATION = "u.HNICU/p.tH";

        const createStock = (id: string, initvalue: string) => {
            return new FirebaseComponentModel.StockFirebaseComponent(id, { x: 0, y: 0, text: "", initvalue: initvalue })
        }

        const createFlow = (id: string, fromId: string, toId: string, equation: string, dependsOn: string[]) => {
            return new FirebaseComponentModel.FlowFirebaseComponent(id, { from: fromId, to: toId, equation: equation, dependsOn: dependsOn, text: "" });
        }

        const TEST_STOCKS: FirebaseComponentModel.StockFirebaseComponent[] = [
            createStock(S_STOCK_NAME, S_STARTING_VALUE),
            createStock(E_STOCK_NAME, E_STARTING_VALUE),
            createStock(I_STOCK_NAME, I_STARTING_VALUE),
            createStock(R_STOCK_NAME, R_STARTING_VALUE),
            createStock(HICU_STOCK_NAME, HICU_STARTING_VALUE),
            createStock(HNICU_STOCK_NAME, HNICU_STARTING_VALUE)
        ];

        const TEST_FLOWS: FirebaseComponentModel.FlowFirebaseComponent[] = [
            createFlow(NEWINC_FLOW_NAME, S_STOCK_NAME, E_STOCK_NAME, NEWINC_EQUATION, [I_STOCK_NAME, S_STOCK_NAME]),
            createFlow(NEWINF_FLOW_NAME, E_STOCK_NAME, I_STOCK_NAME, NEWINF_EQUATION, [E_STOCK_NAME]),
            createFlow(NEWREC_FLOW_NAME, I_STOCK_NAME, R_STOCK_NAME, NEWREC_EQUATION, [I_STOCK_NAME]),
            createFlow(WANIMM_FLOW_NAME, R_STOCK_NAME, S_STOCK_NAME, WANIMM_EQUATION, [R_STOCK_NAME]),
            createFlow(HICUAD_FLOW_NAME, I_STOCK_NAME, HICU_STOCK_NAME, HICUAD_EQUATION, [I_STOCK_NAME]),
            createFlow(HNICUA_FLOW_NAME, I_STOCK_NAME, HNICU_STOCK_NAME, HNICUA_EQUATION, [I_STOCK_NAME]),
            createFlow(OUTICU_FLOW_NAME, HICU_STOCK_NAME, HNICU_STOCK_NAME, OUTICU_EQUATION, [HICU_STOCK_NAME]),
            createFlow(RECOVH_FLOW_NAME, HNICU_STOCK_NAME, R_STOCK_NAME, RECOVH_EQUATION, [HNICU_STOCK_NAME])
        ];

        const TEST_COMPONENTS: FirebaseDataComponent[] = [...TEST_STOCKS, ...TEST_FLOWS];

        const TEST_PARAMS: { [paramName: string]: string } = {
            'startTime': '0.0',
            'stopTime': '300.0',
            'B': '0.8',
            'N': '3801001.0',
            'tr': '12.22',
            'tw': '2*365.0',
            'fH': '0.002',
            'fICU': '0.23',
            'tICU': '6.0',
            'tH': '12.0',
            'rv': '0.01',
            'eP': '0.6',
            'eF': '0.85',
            'ri': '0.207',
            'ria': '0.138'
        };

        new ComputeModelTask(TEST_COMPONENTS, TEST_PARAMS).start();
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