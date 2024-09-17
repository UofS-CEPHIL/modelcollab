import ModalBox, { Props as ModalBoxProps, State as ModalBoxState } from "./ModalBox";

export interface Props extends ModalBoxProps {

}

export interface State extends ModalBoxState {

}

export default abstract class SaveOrCancelBox extends ModalBox<Props, State> {

}
