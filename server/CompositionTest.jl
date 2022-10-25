# This should be valid Julia code which implements the following
# model. This is the same as the "basic composition" one in the
# Typescript tests for JuliaGenerator

# // [S1 => S2 =]=> S3 => back to S1.
# // S2 and S3 contribute to a sum var.
# // The sum var contributes to S3=>S1.
# // A parameter contributes to S2=>S3.

ENV["GKSwstype"] = "nul"
using StockFlow
 using Catlab
 using Catlab.CategoricalAlgebra
 using LabelledArrays
 using OrdinaryDiffEq
 using Plots
 using Catlab.Graphics
 using Catlab.Programs
 using Catlab.Theories
 using Catlab.WiringDiagrams

model1 = StockAndFlow(
    (
        :S1 => (:S3S1, :F_NONE, :V_NONE, :SV_NONE),
        :S2 => (:F_NONE, :S2S3, :V_NONE, :SV),
        :S3 => (:S2S3, :S3S1, :V_NONE, :SV)
    ),
    (
        :S2S3 => :var_S2S3,
        :S3S1 => :var_S3S1
    ),
    (
        :var_S2S3 => (u, uN, p, t) -> p.P / 123,
        :var_S3S1 => (u, uN, p, t) -> uN.SV(u,t)
    ),   
    (
        :SV => (:var_S3S1)
    )
);

model2 = StockAndFlow(
    (
        :S1 => (:F_NONE, :S1S2, :V_NONE, :SV_NONE),
        :S2 => (:S1S2, :F_NONE, :V_NONE, :SV)
    ),
    (
        :S1S2 => :var_S1S2
    ),
    (
        :var_S1S2 => (u, uN, p, t) -> 0.001
    ),
    (
        :SV => ()
    )
)

footS2 = foot(:S2, :SV, (:S2=>:SV))
footS3 = foot(:S3, :SV, (:S3=>:SV))

relation = @relation (footS2, footS3) begin
    modelA(footS2, footS3)
    modelB(footS2)
end;

model1Open = Open(
    model1,
    footS2,
    footS3
);

model2Open = Open(
    model2,
    footS2
);

composedOpen = oapply(relation, [model1Open, model2Open])
modelApex = apex(composedOpen)

params = LVector(P=123)
u0 = LVector(S1=123, S2=321, S3=456)

prob = ODEProblem(vectorfield(modelApex), u0, (0.0, 100.0), params)
sol = solve(prob, Tsit5(),abstol=1e-8)

plot(sol)
