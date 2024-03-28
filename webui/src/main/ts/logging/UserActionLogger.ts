import LoggableUserAction from "./LoggableUserAction";

export default class UserActionLogger {

    private actions: LoggableUserAction[] = [];

    public logAction(actionName: string, message: string = "") {
        this.actions.push({
            action: actionName,
            message,
            time: new Date(Date.now())
        });
    }

    public toString(): string {
        return JSON.stringify(this.actions, null, ' ');
    }

    public reset(): void {
        this.actions = [];
    }
}
