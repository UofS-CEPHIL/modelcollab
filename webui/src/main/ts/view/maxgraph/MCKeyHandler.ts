import { Graph, InternalEvent, KeyHandler } from "@maxgraph/core";

// A MaxGraph KeyHandler but with a key-up listener too
export default class MCKeyHandler extends KeyHandler {

    public keyupHandler: ((event: KeyboardEvent) => void) | null = null;

    public normalKeysUp: { [key: number]: Function } = {};
    public shiftKeysUp: { [key: number]: Function } = {};
    public controlKeysUp: { [key: number]: Function } = {};
    public controlShiftKeysUp: { [key: number]: Function } = {};

    public constructor(graph: Graph, target: Element | null = null) {
        super(graph, target);
        if (graph != null) {
            this.keyupHandler = (evt) => this.keyUp(evt);
            InternalEvent.addListener(this.target!, 'keyup', this.keyupHandler);
        }
    }

    public keyUp(evt: KeyboardEvent) {
        if (this.isEnabledForEvent(evt) && !this.isEventIgnored(evt)) {
            const boundFunction = this.getFunction(evt);
            if (boundFunction != null) {
                boundFunction(evt);
                InternalEvent.consume(evt);
            }
        }
    }

    public getFunction(evt: KeyboardEvent): Function | null {
        if (evt.type === 'keydown') {
            return super.getFunction(evt);
        }
        else {
            if (evt != null && !evt.altKey) {
                if (evt.ctrlKey) {
                    if (evt.shiftKey) {
                        return this.controlShiftKeysUp[evt.keyCode];
                    }
                    return this.controlKeysUp[evt.keyCode];
                }
                if (evt.shiftKey) {
                    return this.shiftKeysUp[evt.keyCode];
                }
                return this.normalKeysUp[evt.keyCode];
            }
            return null;
        }
    }

    public bindKey(
        code: number,
        func: Function | { up: Function, down: Function }
    ): void {
        if (func instanceof Function) {
            super.bindKey(code, func);
        }
        else {
            this.normalKeys[code] = func.down;
            this.normalKeysUp[code] = func.up;
        }
    }

    public bindShiftKey(
        code: number,
        func: Function | { up: Function, down: Function }
    ): void {
        if (func instanceof Function) {
            super.bindShiftKey(code, func);
        }
        else {
            this.shiftKeys[code] = func.down;
            this.shiftKeysUp[code] = func.up;
        }
    }

    public bindControlKey(
        code: number,
        func: Function | { up: Function, down: Function }
    ): void {
        if (func instanceof Function) {
            super.bindControlKey(code, func);
        }
        else {
            this.controlKeys[code] = func.down;
            this.controlKeysUp[code] = func.up;
        }
    }

    public bindControlShiftKey(
        code: number,
        func: Function | { up: Function, down: Function }
    ): void {
        if (func instanceof Function) {
            super.bindControlShiftKey(code, func);
        }
        else {
            this.controlShiftKeys[code] = func.down;
            this.controlShiftKeysUp[code] = func.up;
        }
    }
}
