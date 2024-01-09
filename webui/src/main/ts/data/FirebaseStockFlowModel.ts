export interface StockFlowSchema {
    name: string,
    ownerUid: string,
    sharedWith: { [uid: string]: "r" | "w" },
    openRead: boolean,
    openWrite: boolean,
    data: {
        components: {
            [componentId: string]: {
                type: string,
                data: any
            }
        },
        loadedModels: {
            [modelUuid: string]: {
                [componentId: string]: {
                    type: string,
                    data: any
                }
            }
        }
        scenarios: {
            [name: string]: {
                startTime: string,
                stopTime: string,
                overrides: {
                    [paramId: string]: string
                }
            }
        },
        substitutions: {
            [replacedId: string]: string
        }
    }
}

export default class FirebaseStockFlowModel {

    public readonly uuid: string;
    public data: StockFlowSchema;

    public constructor(uuid: string, data: StockFlowSchema) {
        this.uuid = uuid;
        this.data = data;
    }

    public static newStockFlow(uuid: string, name: string, ownerUid: string) {
        return new FirebaseStockFlowModel(
            uuid,
            {
                name: name,
                ownerUid: ownerUid,
                sharedWith: {},
                openRead: false,
                openWrite: false,
                data: {
                    components: {},
                    loadedModels: {},
                    scenarios: {},
                    substitutions: {}
                }
            }
        );
    }
}
