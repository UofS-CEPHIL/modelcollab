import { Map as ImmutableMap } from "immutable";
import ModelMetadata from "./ModelMetadata";
import { Permission } from "./RTDBSchema";

export enum ModelUserType {
    OWNER = "Owned",
    SHARED = "Shared",
    PUBLIC = "Public",
};

export type ModelMap = ImmutableMap<string, ModelMetadata>;

export default class FirebaseModelsList {


    public static readonly EMPTY: FirebaseModelsList = new FirebaseModelsList();

    public readonly ownedModels: ModelMap;
    public readonly sharedModels: ModelMap;
    public readonly publicModels: ModelMap;

    private constructor(
        ownedModels: ModelMap = ImmutableMap(),
        sharedModels: ModelMap = ImmutableMap(),
        publicModels: ModelMap = ImmutableMap(),
    ) {
        this.ownedModels = ownedModels;
        this.sharedModels = sharedModels;
        this.publicModels = publicModels;
    }

    public withUpdatedOwnedModels(
        newOwnedModels: ModelMap
    ): FirebaseModelsList {
        return new FirebaseModelsList(
            newOwnedModels,
            this.sharedModels,
            this.publicModels,
        );
    }

    public withUpdatedSharedModels(
        newSharedModels: ModelMap
    ): FirebaseModelsList {
        return new FirebaseModelsList(
            this.ownedModels,
            newSharedModels,
            this.publicModels,
        );
    }

    public withUpdatedPublicModels(
        newPublicModels: ModelMap
    ): FirebaseModelsList {
        return new FirebaseModelsList(
            this.ownedModels,
            this.sharedModels,
            newPublicModels,
        );
    }

    public isEmpty(): boolean {
        return this.totalSize() === 0;
    }

    public totalSize(): number {
        return [
            ...this.ownedModels,
            ...this.sharedModels,
            ...this.publicModels
        ].length;
    }

    public allIds(): string[] {
        return [
            ...this.ownedModels.keys(),
            ...this.sharedModels.keys(),
            ...this.publicModels.keys(),
        ];
    }

    public getModelListForType(t: ModelUserType): ModelMap {
        switch (t) {
            case ModelUserType.OWNER:
                return this.ownedModels;
            case ModelUserType.SHARED:
                return this.sharedModels;
            case ModelUserType.PUBLIC:
                return this.publicModels;
            default:
                throw new Error("Unknown model list type: " + t);
        }
    }

    public withUpdatedModelsList(
        models: ModelMap,
        t: ModelUserType
    ): FirebaseModelsList {
        switch (t) {
            case ModelUserType.OWNER:
                return this.withUpdatedOwnedModels(models);
            case ModelUserType.SHARED:
                return this.withUpdatedSharedModels(models);
            case ModelUserType.PUBLIC:
                return this.withUpdatedPublicModels(models);
            default:
                throw new Error("Unknown model list type: " + t);
        }
    }

    public withDuplicatesFiltered(): FirebaseModelsList {
        const rwPublicModelIds: string[] = [];
        const publicModels = this.publicModels.withMutations(publicModels => {
            for (const modelId of publicModels.keys()) {
                if (this.ownedModels.has(modelId)) {
                    publicModels.remove(modelId);
                }
                else if (this.sharedModels.has(modelId)) {
                    publicModels.remove(modelId);
                    if (
                        this.publicModels.get(modelId)?.userPermission
                        === Permission.READWRITE
                    ) {
                        rwPublicModelIds.push(modelId);
                    }
                }
            }
        });
        const sharedModels = this.sharedModels.withMutations(sharedModels => {
            for (const modelId of sharedModels.keys()) {
                if (rwPublicModelIds.includes(modelId)) {
                    sharedModels.set(
                        modelId,
                        sharedModels.get(modelId)!
                            .withPermission(Permission.READWRITE)
                    );
                }
            }
        });
        return this
            .withUpdatedSharedModels(sharedModels)
            .withUpdatedPublicModels(publicModels);
    }

    public toString(): string {
        return `FirebaseModelsList { ${this.ownedModels.size} owned models, ` +
            `${this.sharedModels.size} shared models, ` +
            `${this.publicModels.size} public models }`;
    }
}
