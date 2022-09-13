import { ReactElement } from "react";
import ComponentRenderer from "../../../../main/ts/components/Canvas/ComponentRenderer";

export default class MockRenderer implements ComponentRenderer {

    public readonly render: jest.Mock<ReactElement[]> = jest.fn();

}
