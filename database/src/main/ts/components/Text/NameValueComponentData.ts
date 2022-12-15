import TextComponentData from "./TextComponentData";

export default interface NameValueComponentData extends TextComponentData {
    x: number;
    y: number;
    text: string;
    value: string;
}
