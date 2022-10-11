ENV["GKSwstype"] = "nul"
print("importing")
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
print("stockandflow")
modelName = StockAndFlow(
    (
        :I => (:infection, :recovery, (:InfectionRate,:var_recovery,:var_infection), :N),
        :R => (:recovery, :death, :V_NONE, :N),
        :S => (:birth, :infection, :var_infection, :N)
    ),
    (
        :recovery => :var_recovery,
        :infection => :var_infection,
        :death => :var_death,
        :birth => :var_birth
    ),
    (
        :InfectionRate => (u, uN, p, t) -> u.I / uN.N(u, t),
        :var_recovery => (u, uN, p, t) -> u.I * p.rRec,
        :var_infection => (u, uN, p, t) -> u.S * p.rInf * u.I / uN.N(u, t),
        :var_death => (u, uN, p, t) -> 10,
        :var_birth => (u, uN, p, t) -> 10
    ),
    (
        :N => (:InfectionRate,:var_infection)
    )
)
 modelNameOpen = Open(modelName, foot(:I, :N, (:I=>:N)), foot(:R, :N, (:R=>:N)), foot(:S, :N, (:S=>:N)))
 modelNameApex = apex(modelNameOpen)
 params = LVector(stopTime=365.0, rInf=0.3, startTime=0.0, rRec=1/7)
 u0 = LVector(I=1, R=0, S=10000)
 prob = ODEProblem(vectorfield(modelNameApex),u0,(0.0,365.0),params)
print("solving")
 sol = solve(prob, Tsit5(), abstol=1e-8)
print("plotting")
 plot(sol) 
print("saving")
 savefig("/tmp/figure.png")
