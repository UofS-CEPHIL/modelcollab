import TextObject from '../TextObject';

export default class DynamicVariable extends TextObject {
    protected getFontStyle(): string {
        return 'normal';
    }
}
