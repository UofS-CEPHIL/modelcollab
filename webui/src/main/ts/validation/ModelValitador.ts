import { FirebaseComponentModel as schema } from "database/build/export";
import { LoadedStaticModel } from "../components/maxgraph/CanvasScreen";

export type ComponentErrors = { [cptId: string]: string[] };

export default class ModelValidator {

    // Includes scientific notation using e or E, e.g. 6.022E23
    public static readonly NUMBER_REGEX = /\d+(\.\d+)?((e|E)\d+)?/g

    public static readonly ILLEGAL_CHARACTERS =
        " .-@#$%^&*()-+=\\|{}[]'\":;/?<>,`~".split('');

    public static findErrors(
        components: schema.FirebaseDataComponent<any>[],
        loadedModels: LoadedStaticModel[]
    ): ComponentErrors {
        const errors: ComponentErrors = {};
        const addErrors = (id: string, e: string[]) => {
            if (e.length == 0) return;
            else if (!errors[id]) errors[id] = e;
            else errors[id].push(...e);
        }

        // General errors
        for (const cpt of components) {
            addErrors(cpt.getId(), this.getComponentErrors(cpt));
        }

        // Duplicate names
        const duplicates = this.getIdsWithDuplicateNames(
            components,
            loadedModels
        );
        for (const id of duplicates) {
            addErrors(id, ["Duplicate name"]);
        }

        return errors;
    }

    public static getIdsWithDuplicateNames(
        components: schema.FirebaseDataComponent<any>[],
        loadedModels: LoadedStaticModel[]
    ): string[] {
        const subbedIds = components.filter(c =>
            c.getType() === schema.ComponentType.SUBSTITUTION
        ).map(c => c.getData().substitudedId);
        const allComponents = loadedModels
            .flatMap(m => m.components)
            .concat(components)
            .filter(c => !subbedIds.includes(c.getId()));

        return allComponents.filter(
            c => c.getData().text
                && allComponents
                    .filter(k => k.getData().text === c.getData().text)
                    .length > 1
        ).map(c => c.getId());
    }

    public static getComponentErrors(
        cpt: schema.FirebaseDataComponent<any>
    ): string[] {
        switch (cpt.getType()) {
            case schema.ComponentType.PARAMETER:
                return this.getParameterErrors(
                    cpt as schema.ParameterFirebaseComponent
                );
            case schema.ComponentType.SUM_VARIABLE:
                return this.getSumVariableErrors(
                    cpt as schema.SumVariableFirebaseComponent
                );
            case schema.ComponentType.STOCK:
                return this.getStockErrors(
                    cpt as schema.StockFirebaseComponent
                );
            case schema.ComponentType.VARIABLE:
                return this.getDynamicVariableErrors(
                    cpt as schema.VariableFirebaseComponent
                );
            case schema.ComponentType.FLOW:
                return this.getFlowErrors(
                    cpt as schema.FlowFirebaseComponent
                );
            default:
                return [];
        }
    }

    public static getStockErrors(cpt: schema.StockFirebaseComponent): string[] {
        return [
            ...this.getComponentNameErrors(cpt.getData().text),
            ...this.getStockInitValueErrors(cpt.getData().initvalue)
        ];
    }

    public static getFlowErrors(cpt: schema.FlowFirebaseComponent): string[] {
        return [
            ...this.getComponentNameErrors(cpt.getData().text),
            ...this.getEquationErrors(cpt.getData().equation)
        ];
    }

    public static getDynamicVariableErrors(
        cpt: schema.VariableFirebaseComponent
    ): string[] {
        return [
            ...this.getComponentNameErrors(cpt.getData().text),
            ...this.getEquationErrors(cpt.getData().value)
        ];
    }

    public static getSumVariableErrors(
        cpt: schema.SumVariableFirebaseComponent
    ): string[] {
        return this.getComponentNameErrors(cpt.getData().text);
    }

    public static getParameterErrors(
        cpt: schema.ParameterFirebaseComponent
    ): string[] {
        const errors = [
            ...this.getComponentNameErrors(cpt.getData().text),
        ];

        if (!this.isValidNumber(cpt.getData().value)) {
            errors.push("Invalid value: " + cpt.getData().value);
        }
        return errors;
    }

    public static getComponentNameErrors(val: string): string[] {
        const errors: string[] = [];
        if (val.length == 0) return ["Name is empty"];
        for (const illegalChar of this.ILLEGAL_CHARACTERS) {
            if (val.includes(illegalChar)) {
                errors.push(`Name contains illegal character: "${illegalChar}"`);
            }
        }
        if (/[0-9]/g.test(val[0])) {
            errors.push("Name cannot start with a number");
        }

        return errors;
    }

    public static isValidNumber(val: string): boolean {
        const matches = val.match(this.NUMBER_REGEX);
        if (!matches || matches.length !== 1 || matches[0] !== val) {
            return false;
        }
        else if (val[0] === '0' || val.includes("E0") || val.includes("e0")) {
            return false;
        }
        return true;
    }

    public static getStockInitValueErrors(val: string): string[] {
        // TODO check if uses connected parameters / is valid Julia code
        const errors: string[] = [];
        if (val.replaceAll(/\s/g, "") == "") errors.push("Empty init value");
        return errors;
    }

    public static getEquationErrors(val: string): string[] {
        // TODO validate equation against allowable DSL operations
        const errors: string[] = [];
        if (val.replaceAll(/\s/g, "") == "") errors.push("Empty equation");
        return errors;
    }

    public static isDuplicateName(
        val: string,
        components: schema.FirebaseDataComponent<any>[]
    ) {
        return components.find(c => c.getData().text === val) !== undefined;
    }
}
