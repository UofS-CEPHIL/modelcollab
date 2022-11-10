import React, { ReactElement } from 'react';


export interface Props {

}

export interface State {

}

export default abstract class ToolbarButton
    <ButtonProps extends Props, ButtonState extends State> extends React.Component<ButtonProps, ButtonState>
{

    protected abstract onClick(): void;



}
