import { Unsubscribe } from "firebase/auth";
import { BasicModelInfo, ModelType } from "./FirebaseDataModel";
import { Permission } from "./RTDBSchema";

export default class ModelMetadata {
    public readonly modelId: string;
    public readonly unsubscribeFromModelMetadata: Unsubscribe;
    public readonly unsubscribeFromUserPermission?: Unsubscribe;
    public readonly unsubscribeFromModelOwnerData?: Unsubscribe;
    public readonly userPermission?: Permission;
    public readonly modelType?: ModelType;
    public readonly modelName?: string;
    public readonly ownerUid?: string;
    public readonly ownerName?: string;
    public readonly ownerEmail?: string;

    public constructor(
        modelId: string,
        unsubscribeFromModelMetadata: Unsubscribe,
        unsubscribeFromUserPermission?: Unsubscribe,
        unsubscribeFromModelOwnerData?: Unsubscribe,
        userPermission?: Permission,
        modelType?: ModelType,
        modelName?: string,
        ownerUid?: string,
        ownerName?: string,
        ownerEmail?: string,
    ) {
        this.modelId = modelId;
        this.unsubscribeFromModelMetadata = unsubscribeFromModelMetadata;
        this.unsubscribeFromUserPermission = unsubscribeFromUserPermission;
        this.unsubscribeFromModelOwnerData = unsubscribeFromModelOwnerData;
        this.userPermission = userPermission;
        this.modelType = modelType;
        this.modelName = modelName;
        this.ownerUid = ownerUid;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
    }

    public isEmpty(): boolean {
        return this.modelType === undefined
            && this.modelName === undefined;
    }

    public withModelName(name: string): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            this.userPermission,
            this.modelType,
            name,
            this.ownerUid,
            this.ownerName,
            this.ownerEmail,
        );
    }

    public withOwnerData(name?: string, email?: string): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            this.userPermission,
            this.modelType,
            this.modelName,
            this.ownerUid,
            name,
            email,
        );
    }

    public withPermission(permission?: Permission): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            permission,
            this.modelType,
            this.modelName,
            this.ownerUid,
            this.ownerName,
            this.ownerEmail,
        );
    }

    public updateFromBasicModelInfo(m: BasicModelInfo): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            this.userPermission,
            m.type,
            m.name,
            m.ownerUid,
            this.ownerName,
            this.ownerEmail,
        );
    }

    public deleteModelMetadata(): ModelMetadata {
        return new ModelMetadata(
            this.modelId,
            this.unsubscribeFromModelMetadata,
            this.unsubscribeFromUserPermission,
            this.unsubscribeFromModelOwnerData,
            this.userPermission,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        );
    }

    public unsubscribe(): void {
        this.unsubscribeFromModelMetadata();
        if (this.unsubscribeFromUserPermission) {
            this.unsubscribeFromUserPermission();
        }
        if (this.unsubscribeFromModelOwnerData) {
            this.unsubscribeFromModelOwnerData();
        }
    }
}
