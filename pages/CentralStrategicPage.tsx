import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  Calculator,
  FileSearch,
  LayoutDashboard,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Target,
  UserCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/RiskCalculator";

type DebtField = "simples" | "previdenciario" | "tributario" | "demais" | "rfb";

const OFFICIAL_SOURCES = [
  {
    name: "Receita Federal",
    description: "Normas, orientações e publicações sobre obrigações e Reforma Tributária.",
    href: "https://www.gov.br/receitafederal/pt-br",
  },
  {
    name: "PGFN",
    description: "Editais, modalidades de negociação e condições oficiais de regularização.",
    href: "https://www.gov.br/pgfn/pt-br",
  },
  {
    name: "Ministério da Fazenda",
    description: "Atos, comunicados e medidas com impacto econômico e tributário.",
    href: "https://www.gov.br/fazenda/pt-br",
  },
  {
    name: "IBS / CBS",
    description: "Cronogramas, regulamentação e orientações do novo sistema de consumo.",
    href: "https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria",
  },
];

export function CentralStrategicPage() {
  const [query, setQuery] = useState("");
  const [reform, setReform] = useState({
    revenue: "",
    regime: "",
    activity: "",
    b2b: "",
    purchases: "",
    payroll: "",
    taxes: "",
  });
  const [debts, setDebts] = useState<Record<DebtField, string>>({
    simples: "",
    previdenciario: "",
    tributario: "",
    demais: "",
    rfb: "",
  });
  const [companyProfile, setCompanyProfile] = useState({
    size: "",
    capag: "",
    impediment: "nao_sei",
    rfbSituation: "inicial",
    enforcement: "nao",
    seizure: "nao",
  });

  const totalDebt = useMemo(
    () => Object.values(debts).reduce((sum, value) => sum + parseMoney(value), 0),
    [debts],
  );

  const rfbEntryRate = companyProfile.rfbSituation === "primeiro" ? 0.1 : companyProfile.rfbSituation === "novo" ? 0.2 : 0;
  const rfbEntry = parseMoney(debts.rfb) * rfbEntryRate;
  const hasPriority = companyProfile.enforcement === "sim" || companyProfile.seizure === "sim";
  const hasImpediment = companyProfile.impediment === "sim";

  function updateDebt(field: DebtField, value: string) {
    setDebts((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="min-h-screen bg-[#eef3ef] text-[#102524]">
      <div className="grid min-h-screen lg:grid-cols-[76px_1fr]">
        <aside className="border-b border-white/10 bg-[#092321] text-white lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-4 lg:flex-col lg:gap-6 lg:px-0 lg:py-6">
            <Link to="/app/inicio" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0a2b28] shadow-lg shadow-black/10">
              <ShieldCheck className="h-5 w-5" />
            </Link>
            <nav className="flex items-center gap-2 lg:flex-col">
              <SideLink to="/app/inicio" label="Início" icon={LayoutDashboard} />
              <SideLink to="/app/pro" label="Área Pro" icon={BriefcaseBusiness} />
              <SideLink to="/app/diagnostico/novo" label="Diagnóstico" icon={Calculator} />
              <SideLink to="/admin/usuarios" label="Configurações" icon={Settings} />
            </nav>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="bg-[#092321] px-4 py-5 text-white shadow-xl shadow-[#0a2b28]/15 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10">
                  <ShieldCheck className="h-7 w-7 text-[#d0ad63]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Central Estratégica</h1>
                  <p className="mt-1 max-w-2xl text-sm text-white/68">
                    Descubra como a Reforma Tributária e o passivo federal podem afetar o caixa da sua empresa.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:min-w-[650px] xl:flex-row xl:items-center">
                <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white px-4 text-sm text-[#5d6d68] shadow-lg shadow-black/10">
                  <Search className="h-4 w-4 text-[#0b5a51]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full border-0 bg-transparent text-[#102524] outline-none"
                    placeholder="Buscar empresa, CNPJ ou diagnóstico"
                  />
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-3 py-2">
                  <button type="button" className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white" aria-label="Notificações">
                    <Bell className="h-4 w-4" />
                  </button>
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0a2b28]">
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Área autenticada</p>
                    <p className="text-xs text-white/58">Central de análise</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="rounded-3xl border border-[#dce5e0] bg-white px-5 py-5 shadow-lg shadow-[#102524]/5 md:px-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b49355]">Diagnóstico preliminar</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#102524]">Sua empresa pode estar absorvendo custos e riscos ainda não mapeados.</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-[#61736d]">
                Preencha os dados essenciais. Esta tela gera apenas uma leitura inicial; cenários técnicos, parâmetros e estratégias completas permanecem na Área Pro.
              </p>
            </section>

            <section className="grid gap-6 2xl:grid-cols-2">
              <article className="overflow-hidden rounded-[30px] border border-[#dce5e0] bg-white shadow-xl shadow-[#102524]/7">
                <div className="bg-[linear-gradient(135deg,#082637_0%,#0b4b63_58%,#062b3b_100%)] p-6 text-white md:p-7">
                  <div className="flex items-start gap-4">
                    <div className="grid h-13 w-13 place-items-center rounded-2xl border border-white/10 bg-white/10">
                      <Target className="h-6 w-6 text-[#d0ad63]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Como a Reforma pode afetar sua empresa?</h2>
                      <p className="mt-2 text-sm leading-6 text-white/70">Informe as premissas principais para visualizar possíveis impactos sobre custos, margem e caixa.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 md:p-7 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Faturamento mensal" value={reform.revenue} onChange={(value) => setReform({ ...reform, revenue: value })} placeholder="R$ 0,00" />
                    <SelectField label="Regime tributário" value={reform.regime} onChange={(value) => setReform({ ...reform, regime: value })} options={["Simples Nacional", "Lucro Presumido", "Lucro Real", "Outro"]} />
                    <SelectField label="Atividade principal" value={reform.activity} onChange={(value) => setReform({ ...reform, activity: value })} options={["Comércio", "Indústria", "Serviços", "Misto"]} />
                    <Field label="Vendas B2B (%)" value={reform.b2b} onChange={(value) => setReform({ ...reform, b2b: value })} placeholder="Ex.: 60" />
                    <Field label="Compras e insumos mensais" value={reform.purchases} onChange={(value) => setReform({ ...reform, purchases: value })} placeholder="R$ 0,00" />
                    <Field label="Folha de pagamento mensal" value={reform.payroll} onChange={(value) => setReform({ ...reform, payroll: value })} placeholder="R$ 0,00" />
                    <Field label="Tributos pagos atualmente" value={reform.taxes} onChange={(value) => setReform({ ...reform, taxes: value })} placeholder="R$ 0,00" />
                  </div>

                  <div className="rounded-2xl bg-[#f3f7f5] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b5a51]">Leitura preliminar</p>
                    <SummaryLine label="Carga atual estimada" value={reform.revenue && reform.taxes ? estimateTaxRate(reform.revenue, reform.taxes) : "—"} />
                    <SummaryLine label="Carga projetada" value="A calcular" />
                    <SummaryLine label="Possível impacto anual" value="A calcular" />
                    <SummaryLine label="Créditos estimados" value="A validar" />
                    <SummaryLine label="Pressão sobre margem" value={reform.revenue ? "Em análise" : "—"} />
                    <p className="mt-5 rounded-xl border border-[#d9e5df] bg-white p-3 text-xs leading-5 text-[#61736d]">
                      O resultado completo depende da composição de receitas, créditos, cadeia de compras, regime e regulamentação aplicável.
                    </p>
                  </div>
                </div>
              </article>

              <article className="overflow-hidden rounded-[30px] border border-[#dce5e0] bg-white shadow-xl shadow-[#102524]/7">
                <div className="bg-[linear-gradient(135deg,#082a27_0%,#0c4f47_58%,#08332f_100%)] p-6 text-white md:p-7">
                  <div className="flex items-start gap-4">
                    <div className="grid h-13 w-13 place-items-center rounded-2xl border border-white/10 bg-white/10">
                      <Building2 className="h-6 w-6 text-[#d0ad63]" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Entenda o peso atual das suas dívidas</h2>
                      <p className="mt-2 text-sm leading-6 text-white/70">Separe PGFN e Receita Federal para visualizar a pressão financeira do cenário atual.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 md:p-7 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <SelectField label="Porte da empresa" value={companyProfile.size} onChange={(value) => setCompanyProfile({ ...companyProfile, size: value })} options={["MEI", "Microempresa", "EPP", "Demais empresas", "Outro"]} />
                      <SelectField label="CAPAG" value={companyProfile.capag} onChange={(value) => setCompanyProfile({ ...companyProfile, capag: value })} options={["A", "B", "C", "D", "Não informada"]} />
                      <SelectField label="Impedimento" value={companyProfile.impediment} onChange={(value) => setCompanyProfile({ ...companyProfile, impediment: value })} options={["sim|Sim", "nao|Não", "nao_sei|Não sei"]} />
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b5a51]">Dívidas na PGFN</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Simples Nacional" value={debts.simples} onChange={(value) => updateDebt("simples", value)} placeholder="R$ 0,00" />
                        <Field label="Previdenciário" value={debts.previdenciario} onChange={(value) => updateDebt("previdenciario", value)} placeholder="R$ 0,00" />
                        <Field label="Tributário" value={debts.tributario} onChange={(value) => updateDebt("tributario", value)} placeholder="R$ 0,00" />
                        <Field label="Demais Débitos" value={debts.demais} onChange={(value) => updateDebt("demais", value)} placeholder="R$ 0,00" />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#dce5e0] bg-[#f8faf9] p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b5a51]">Receita Federal</p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Débitos na Receita Federal" value={debts.rfb} onChange={(value) => updateDebt("rfb", value)} placeholder="R$ 0,00" />
                        <SelectField label="Situação atual" value={companyProfile.rfbSituation} onChange={(value) => setCompanyProfile({ ...companyProfile, rfbSituation: value })} options={["inicial|Parcelamento inicial", "primeiro|Primeiro reparcelamento", "novo|Já houve reparcelamento anterior", "nao_sei|Não sei"]} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Existe execução fiscal ativa?" value={companyProfile.enforcement} onChange={(value) => setCompanyProfile({ ...companyProfile, enforcement: value })} options={["nao|Não", "sim|Sim", "nao_sei|Não sei"]} />
                      <SelectField label="Já ocorreu bloqueio ou penhora?" value={companyProfile.seizure} onChange={(value) => setCompanyProfile({ ...companyProfile, seizure: value })} options={["nao|Não", "sim|Sim", "nao_sei|Não sei"]} />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#f3f7f5] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b5a51]">Resumo do cenário</p>
                    <p className="mt-4 text-sm text-[#61736d]">Passivo federal informado</p>
                    <p className="mt-1 text-3xl font-semibold text-[#102524]">{formatCurrency(totalDebt)}</p>
                    <SummaryLine label="Entrada imediata estimada na RFB" value={rfbEntry > 0 ? formatCurrency(rfbEntry) : "Sem entrada extraordinária"} />
                    <SummaryLine label="Pressão financeira atual" value={totalDebt > 0 ? (rfbEntryRate > 0 ? "Elevada" : "Em análise") : "—"} />
                    <SummaryLine label="Possível cenário estratégico" value={totalDebt > 0 ? "Avaliação recomendada" : "—"} />

                    {hasImpediment ? (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                        <p className="font-semibold">Transação restrita no cenário atual</p>
                        <p className="mt-1 text-xs leading-5">Avaliar regularização disponível, pagamento, garantia e revisão da situação.</p>
                      </div>
                    ) : null}

                    {hasPriority ? (
                      <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                        <div className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> Tratamento prioritário</div>
                        <p className="mt-1 text-xs leading-5">Execução, bloqueio ou penhora exigem avaliação imediata das alternativas de regularização e proteção patrimonial.</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            </section>

            <section className="flex flex-col gap-4 rounded-3xl border border-[#d9e2dd] bg-white px-5 py-5 shadow-lg shadow-[#102524]/5 md:flex-row md:items-center md:justify-between md:px-7">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#e7f0ec] text-[#0b5a51]">
                  <Target className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#102524]">Uma análise completa revela o que os números isolados não mostram.</h2>
                  <p className="mt-1 text-sm text-[#61736d]">Conecte empresa, passivo, Reforma, riscos, oportunidades e estratégia em um único diagnóstico.</p>
                </div>
              </div>
              <Link to="/app/diagnostico/novo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0b4f49] px-5 text-sm font-semibold text-white shadow-lg shadow-[#0b4f49]/20 transition hover:bg-[#0a423d]">
                SOLICITAR ANÁLISE COMPLETA
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="grid gap-5 rounded-[28px] bg-[#f7faf8] p-5 md:p-6 xl:grid-cols-[0.7fr_1.8fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b49355]">Fontes oficiais</p>
                <h2 className="mt-3 text-2xl font-semibold text-[#102524]">Fique ligado nas decisões</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-[#61736d]">Acompanhe atualizações institucionais que podem afetar custos, regularização e planejamento.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {OFFICIAL_SOURCES.map((source) => (
                  <a key={source.name} href={source.href} target="_blank" rel="noreferrer" className="flex min-h-[210px] flex-col rounded-3xl border border-[#e0e7e3] bg-white p-5 shadow-lg shadow-[#102524]/5 transition hover:-translate-y-0.5 hover:border-[#b7cec4]">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f0ec] text-[#0b5a51]"><FileSearch className="h-5 w-5" /></div>
                    <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#b49355]">Fonte oficial</p>
                    <h3 className="mt-2 text-lg font-semibold text-[#102524]">{source.name}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-[#61736d]">{source.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0b5a51]">Ver atualizações <ArrowRight className="h-4 w-4" /></span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#314744]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-11 rounded-xl border border-[#d4dfda] bg-white px-3 text-[#102524] outline-none transition focus:border-[#0b5a51] focus:ring-2 focus:ring-[#0b5a51]/10" />
    </label>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#314744]">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-11 rounded-xl border border-[#d4dfda] bg-white px-3 text-[#102524] outline-none transition focus:border-[#0b5a51] focus:ring-2 focus:ring-[#0b5a51]/10">
        <option value="">Selecione</option>
        {options.map((option) => {
          const [optionValue, optionLabel] = option.includes("|") ? option.split("|") : [option, option];
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
        })}
      </select>
    </label>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-start justify-between gap-4 border-b border-[#dfe8e3] pb-3 last:border-0">
      <span className="text-sm text-[#61736d]">{label}</span>
      <strong className="text-right text-sm text-[#102524]">{value}</strong>
    </div>
  );
}

function SideLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof LayoutDashboard }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
  return (
    <Link to={to} aria-label={label} title={label} className={`grid h-11 w-11 place-items-center rounded-xl transition ${active ? "bg-white text-[#0a2b28]" : "text-white/62 hover:bg-white/10 hover:text-white"}`}>
      <Icon className="h-5 w-5" />
    </Link>
  );
}

function parseMoney(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.-]/g, "");
  return Number(normalized) || 0;
}

function estimateTaxRate(revenue: string, taxes: string) {
  const monthlyRevenue = parseMoney(revenue);
  const monthlyTaxes = parseMoney(taxes);
  if (monthlyRevenue <= 0) return "—";
  return `${((monthlyTaxes / monthlyRevenue) * 100).toFixed(2).replace(".", ",")}%`;
}
