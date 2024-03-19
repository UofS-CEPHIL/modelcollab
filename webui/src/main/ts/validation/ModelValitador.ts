import ComponentType from "../data/components/ComponentType";
import FirebaseComponent from "../data/components/FirebaseComponent";
import FirebaseDynamicVariable from "../data/components/FirebaseDynamicVariable";
import FirebaseFlow from "../data/components/FirebaseFlow";
import FirebaseParameter from "../data/components/FirebaseParameter";
import FirebaseStock from "../data/components/FirebaseStock";
import FirebaseSumVariable from "../data/components/FirebaseSumVariable";
import { LoadedStaticModel } from "../view/Screens/StockFlowScreen";

export type ComponentErrors = { [cptId: string]: string[] };

export default class ModelValidator {

    // Includes scientific notation using e or E, e.g. 6.022E23
    public static readonly NUMBER_REGEX = /\d+(\.\d+)?((e|E)\d+)?/g

    public static readonly ILLEGAL_CHARACTERS =
        " .-@#$%^&*()-+=\\|{}[]'\":;/?<>,`~".split('');

    public static findErrors(
        components: FirebaseComponent[],
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
        components: FirebaseComponent[],
        loadedModels: LoadedStaticModel[]
    ): string[] {
        const subbedIds = components.filter(c =>
            c.getType() === ComponentType.SUBSTITUTION
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
        cpt: FirebaseComponent
    ): string[] {
        switch (cpt.getType()) {
            case ComponentType.PARAMETER:
                return this.getParameterErrors(cpt as FirebaseParameter);
            case ComponentType.SUM_VARIABLE:
                return this.getSumVariableErrors(cpt as FirebaseSumVariable);
            case ComponentType.STOCK:
                return this.getStockErrors(cpt as FirebaseStock);
            case ComponentType.VARIABLE:
                return this.getDynamicVariableErrors(
                    cpt as FirebaseDynamicVariable
                );
            case ComponentType.FLOW:
                return this.getFlowErrors(cpt as FirebaseFlow);
            default:
                return [];
        }
    }

    public static getStockErrors(cpt: FirebaseStock): string[] {
        return [
            ...this.getComponentNameErrors(cpt.getData().text),
            ...this.getStockInitValueErrors(cpt.getData().value)
        ];
    }

    public static getFlowErrors(cpt: FirebaseFlow): string[] {
        return [
            ...this.getComponentNameErrors(cpt.getData().text),
            ...this.getEquationErrors(cpt.getData().equation)
        ];
    }

    public static getDynamicVariableErrors(
        cpt: FirebaseDynamicVariable
    ): string[] {
        return [
            ...this.getComponentNameErrors(cpt.getData().text),
            ...this.getEquationErrors(cpt.getData().value)
        ];
    }

    public static getSumVariableErrors(cpt: FirebaseSumVariable): string[] {
        return this.getComponentNameErrors(cpt.getData().text);
    }

    public static getParameterErrors(cpt: FirebaseParameter): string[] {
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
        components: FirebaseComponent[]
    ) {
        return components.find(c => c.getData().text === val) !== undefined;
    }
}
