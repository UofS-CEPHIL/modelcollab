import JuliaGenerator from "../../../main/ts/compute/JuliaGeneratorOld";
import JuliaGeneratorTest from "./JuliaGeneratorTest";

export default class JuliaGeneratorDegenerate extends JuliaGeneratorTest {

    public describeTests(): void {
        describe("Degenerate models", () => {
            test("No components", async () => {
                expect(() => new JuliaGenerator([]).generateJulia("")).toThrow();
            });

            test("No start time", async () => {
                expect(() => new JuliaGenerator([this.STOP_TIME_COMPONENT]).generateJulia("")).toThrow();
            });

            test("No stop time", async () => {
                expect(() => new JuliaGenerator([this.START_TIME_COMPONENT]).generateJulia("")).toThrow();
            });

            test("No stocks", async () => {
                expect(() => new JuliaGenerator([this.START_TIME_COMPONENT, this.STOP_TIME_COMPONENT]).generateJulia("")).toThrow();
            });
        });
    }
}

new JuliaGeneratorDegenerate().describeTests();
