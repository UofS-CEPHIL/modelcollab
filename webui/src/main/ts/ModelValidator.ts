import { FirebaseComponentModel as schema } from "database/build/export";
import ComponentCollection from "./components/Canvas/ComponentCollection";


export default class ModelValidator {

    private readonly components: ComponentCollection;

    constructor(components: ComponentCollection) {
        this.components = components;
    }

    public isValid(): boolean {
        return this.findErrors().length == 0;
    }

    public findErrors(): string[] {
        const errors: string[] = [
            // TODO add more checks
            ...this.checkStartTimeStopTime()
        ]

        return errors;
    }

    // Check the start time and stop time params for errors; return the list of
    // any/all errors found, or empty if none.
    private checkStartTimeStopTime(): string[] {
        const isSimpleNumber = (s: string) => {
            return /[0-9]+(\.[0-9]+)?/.test(s);
        }

        const errors: string[] = [];
        const start = this.components.getParameters()
            .find(p => p.getData().text == "startTime");
        const stop = this.components.getParameters()
            .find(p => p.getData().text == "stopTime");

        // Start time
        if (start) {
            if (!isSimpleNumber(start.getData().value)) {
                errors.push("Invalid start time value: ${start.getData().value}")
            }
        }
        else {
            errors.push("No start time parameter found");
        }

        // Stop time
        if (stop) {
            if (!isSimpleNumber(stop.getData().value)) {
                errors.push("Invalid stop time value: ${stop.getData().value}")
            }
        }
        else {
            errors.push("No stop time parameter found");
        }

        return errors;
    }
}
