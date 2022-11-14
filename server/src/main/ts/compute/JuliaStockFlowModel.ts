import { FirebaseComponentModel as schema } from "database/build/export";
import JuliaFlowComponent from "./JuliaFlowComponent";
import JuliaStockComponent from "./JuliaStockComponent";
import JuliaVariableComponent from "./JuliaVariableComponent";
import JuliaSumVariableComponent from "./JuliaSumVariableComponent";
import JuliaParameterComponent from "./JuliaParameterComponent";
import JuliaComponentData from "./JuliaComponentData";
import Foot from "./Foot";
import ModelComponentIdentification from "./ModelComponentIdentification";
import Graph from "./ComponentGraph";

export interface Components {
    stocks: JuliaStockComponent[];
    flows: JuliaFlowComponent[];
    parameters: JuliaParameterComponent[];
    variables: JuliaVariableComponent[];
    sumVariables: JuliaSumVariableComponent[];
}

export default class JuliaStockFlowModel {

    private components: JuliaComponentData[];
    private modelName: string;

    public constructor(name: string, myComponents: JuliaComponentData[]) {
        this.components = myComponents;
        this.modelName = name;
    }

    public getComponents(): JuliaComponentData[] {
        return this.components;
    }

    public getName(): string {
        return this.modelName;
    }

    public getStockAndFlowVarName(): string {
        return `${this.modelName}_stockflow`;
    }

    public getOpenVarName(): string {
        return `${this.modelName}_open`;
    }

    public makeFeet(idents: ModelComponentIdentification[], models: JuliaStockFlowModel[]): Foot[] {
        /*
        Create a list L to contain foot() objects
        For each model M:
          For each shared stock S:
            create a foot for S, where S connects with only those sum variables
            to which it is connected inside of M. Add the foot to L.
          For each shared sum variable SV: 
            if there is already a foot which references SV, do nothing
            else, create a foot for SV with no stocks and add it to L
        Remove any duplicate objects from L
        If Model has no feet, give one empty foot    

        Sharing only happens via substitutions
         
        */

        const relevantIdents = idents
            .filter(i => i.modelA === this.modelName || i.modelB === this.modelName);
        const sharedStockIdents = relevantIdents
            .filter(i => i.componentType === schema.ComponentType.STOCK);
        const sharedSumVarIdents = relevantIdents
            .filter(i => i.componentType === schema.ComponentType.SUM_VARIABLE);

        const stockFeet = sharedStockIdents.map(ident => {
            const stock = this.components.find(c => c.firebaseId === ident.componentFirebaseId);
            if (!stock) throw new Error(`Found ident ${ident} but no matching stock in ${this.components}`);
            return new Foot(
                stock.name,
                [...(stock as JuliaStockComponent).contributingSumVarNames],
                [this.getName()]
            );
        });

        const varFeet = sharedSumVarIdents.map(ident => {
            const sumVar = this.components.find(c => c.firebaseId === ident.componentFirebaseId);
            if (!sumVar) throw new Error(`Found ident ${ident} but no matching sumvar in ${this.components}`);
            const feetReferencingSumVar = stockFeet.filter(f => f.getSumVarNames().includes(sumVar.name));
            if (feetReferencingSumVar.length === 0) {
                return new Foot(
                    null,
                    [sumVar.name],
                    [this.getName()]
                );
            }
            else return null;
        }).filter(c => c !== null) as Foot[];

        const outputArr = stockFeet.concat(varFeet);
        if (outputArr.length > 0) {
            return outputArr;
        }
        else {
            return [new Foot(null, [], [this.getName()])]
        }
    }
}
