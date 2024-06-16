// Override properties of components in a static model. For each static model,
// give a mapping between componentIds and their overridden property values
export default interface FirebasePropertyOverrides {
    [modelId: string]: { [cptId: string]: ComponentPropertyOverrides }
}

export interface ComponentPropertyOverrides { [prop: string]: string };
