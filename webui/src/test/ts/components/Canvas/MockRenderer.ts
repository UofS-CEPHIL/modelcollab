import { ReactElement } from "react";
import ComponentRenderer from "../../../../main/ts/components/Canvas/Renderer/ComponentRenderer";

export default class MockRenderer implements ComponentRenderer {

    public readonly render: jest.Mock<ReactElement[]> = jest.fn();

}
