import TextObject from './TextObject';

export default class Variable extends TextObject {
    protected getFontStyle(): string {
        return 'normal';
    }
}
