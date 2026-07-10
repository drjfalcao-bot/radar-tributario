import { useEffect, useMemo, useState, type ChangeEvent, type LucideIcon } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CircleDollarSign,
  FileSearch,
  Landmark,
  LayoutDashboard,
  Network,
  Scale,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  UserCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/RiskCalculator";
import { getCurrentAuthorizedUser, type AuthorizedUser } from "@/lib/storage";

type DebtField = "simples" | "previdenciario" | "tributario" | "demais" | "rfb";

type OfficialSource = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    name: "Receita Federal",
    description: "Acompanhe normas, atos e orientações que impactam obrigações e regras tributárias.",
    href: "https://www.gov.br/receitafederal/pt-br",
    icon: FileSearch,
  },
  {
    name: "PGFN",
    description: "Fique por dentro de editais, transações, negociações e oportunidades de regularização.",
    href: "https://www.gov.br/pgfn/pt-br",
    icon: Scale,
  },
  {
    name: "Ministério da Fazenda",
    description: "Acompanhe políticas, medidas e projetos que moldam o sistema tributário brasileiro.",
    href: "https://www.gov.br/fazenda/pt-br",
    icon: Landmark,
  },
  {
    name: "IBS/CBS",
    description: "Novidades sobre o novo sistema de tributação sobre consumo e sua implementação.",
    href: "https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria",
    icon: Network,
  },
];

export function CentralStrategicPage() {
  const [user, setUser] = useState<AuthorizedUser | null>(null);
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

  useEffect(() => {
    getCurrentAuthorizedUser().then(setUser).catch(() => setUser(null));
  }, []);

  const totalDebt = useMemo(
    () => Object.values(debts).reduce((sum, value) => sum + parseMoney(value), 0),
    [debts],
  );

  const rfbEntryRate = companyProfile.rfbSituation === "primeiro" ? 0.1 : companyProfile.rfbSituation === "novo" ? 0.2 : 0;
  const rfbEntry = parseMoney(debts.rfb) * rfbEntryRate;
  const hasPriority = companyProfile.enforcement === "sim" || companyProfile.seizure === "sim";
  const hasImpediment = companyProfile.impediment === "sim";
  const displayName = user?.nome || user?.email || "Usuário";
  const displayRole = user?.role ? roleLabel(user.role) : "Sessão ativa";

  function updateDebt(field: DebtField, value: string) {
    setDebts((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="min-h-screen bg-[#f4f6f4] text-[#102524]">
      <div className="grid min-h-screen lg:grid-cols-[72px_1fr]">
        <aside className="border-b border-white/10 bg-[#062c2e] text-white lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-3 py-4 lg:min-h-screen lg:flex-col lg:py-5">
            <div className="flex items-center gap-2 lg:flex-col lg:gap-5">
              <Link to="/app/inicio" className="grid h-12 w-12 place-items-center rounded-xl text-[#d8aa51]">
                <ShieldCheck className="h-8 w-8" strokeWidth={1.6} />
              </Link>
              <nav className="flex items-center gap-2 lg:flex-col">
                <SideLink to="/app/inicio" label="Início" icon={LayoutDashboard} />
                <SideLink to="/app/pro" label="Área Pro" icon={BriefcaseBusiness} />
                <SideLink to="/app/diagnostico/novo" label="Diagnóstico" icon={Calculator} />
              </nav>
            </div>
            <SideLink to="/admin/usuarios" label="Configurações" icon={Settings} />
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-white/10 bg-[radial-gradient(circle_at_45%_140%,rgba(16,95,86,0.24),transparent_42%),linear-gradient(90deg,#062c2e,#07383a)] px-4 py-5 text-white sm:px-6 lg:px-7">
            <div className="mx-auto flex max-w-[1700px] flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-[38px]">Central Estratégica</h1>
                <p className="mt-1 max-w-xl text-sm leading-5 text-white/78">
                  Descubra como as mudanças tributárias e o passivo federal podem afetar o caixa da sua empresa
                </p>
              </div>

              <div className="flex flex-col gap-3 xl:min-w-[700px] xl:flex-row xl:items-center xl:justify-end">
                <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-white/15 bg-white/8 px-4 text-sm text-white/68 backdrop-blur">
                  <Search className="h-5 w-5" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full border-0 bg-transparent text-white outline-none placeholder:text-white/55"
                    placeholder="Buscar empresa, CNPJ ou diagnóstico"
                  />
                </label>
                <button type="button" className="relative grid h-11 w-11 place-items-center rounded-xl text-white/85" aria-label="Notificações">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-[#0c8e81] px-1 text-[10px] font-bold">3</span>
                </button>
                <div className="flex items-center gap-3 rounded-xl px-2 py-1">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-[#d8aa51]/35 bg-white/10">
                    <UserCircle className="h-7 w-7 text-[#e8d6a8]" />
                  </div>
                  <div className="min-w-0">
                    <p className="max-w-44 truncate text-sm font-semibold">{displayName}</p>
                    <p className="text-xs text-white/58">{displayRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1700px] gap-4 px-3 py-3 sm:px-5 lg:px-3">
            <section className="grid gap-3 2xl:grid-cols-2">
              <StrategicPanel
                icon={Scale}
                title="Como a Reforma pode afetar sua empresa?"
                description="Tenha uma visão preliminar de como a Reforma Tributária pode impactar seus custos, margem e caixa."
                tone="green"
              >
                <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                  <div className="grid content-start gap-3">
                    <DarkField label="Faturamento mensal" value={reform.revenue} onChange={(value) => setReform({ ...reform, revenue: value })} placeholder="R$ 0,00" icon={CircleDollarSign} />
                    <DarkSelect label="Regime tributário" value={reform.regime} onChange={(value) => setReform({ ...reform, regime: value })} options={["Simples Nacional", "Lucro Presumido", "Lucro Real", "Outro"]} icon={Calculator} />
                    <DarkSelect label="Atividade principal" value={reform.activity} onChange={(value) => setReform({ ...reform, activity: value })} options={["Comércio", "Indústria", "Serviços", "Misto"]} icon={BriefcaseBusiness} />
                    <DarkField label="Vendas B2B (%)" value={reform.b2b} onChange={(value) => setReform({ ...reform, b2b: value })} placeholder="Ex.: 60" icon={Network} />
                    <DarkField label="Compras e insumos mensais" value={reform.purchases} onChange={(value) => setReform({ ...reform, purchases: value })} placeholder="R$ 0,00" icon={Building2} />
                    <DarkField label="Folha de pagamento mensal" value={reform.payroll} onChange={(value) => setReform({ ...reform, payroll: value })} placeholder="R$ 0,00" icon={UserCircle} />
                    <DarkField label="Tributos pagos atualmente" value={reform.taxes} onChange={(value) => setReform({ ...reform, taxes: value })} placeholder="R$ 0,00" icon={Calculator} />
                  </div>

                  <div className="flex flex-col rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-sm font-semibold">Resultado preliminar</p>
                    <ResultRow label="Carga atual estimada" value={reform.revenue && reform.taxes ? estimateTaxRate(reform.revenue, reform.taxes) : "—%"} detail="sobre faturamento" icon={CircleDollarSign} />
                    <ResultRow label="Carga projetada" value="—%" detail="sobre faturamento" icon={BarChart3} />
                    <ResultRow label="Possível impacto anual" value="R$ —" detail="impacto no caixa" icon={CircleDollarSign} />
                    <ResultRow label="Créditos estimados" value="R$ —" detail="potencial de recuperação" icon={FileSearch} />
                    <ResultRow label="Pressão sobre margem" value="—" detail="baixo  •  médio  •  alto" icon={Target} />
                    <Link to="/app/diagnostico/novo" className="mt-auto inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[#13a897]/45 bg-[#0d7d71] px-4 text-sm font-bold text-white shadow-lg shadow-black/15 transition hover:bg-[#0f8b7e]">
                      VER ANÁLISE PRELIMINAR <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </StrategicPanel>

              <StrategicPanel
                icon={Landmark}
                title="Entenda o peso atual das suas dívidas"
                description="Informe seus débitos federais para entender o impacto atual no seu caixa e os caminhos estratégicos disponíveis."
                tone="blue"
              >
                <div className="grid gap-4 xl:grid-cols-[0.96fr_0.9fr_0.8fr]">
                  <div className="grid content-start gap-3">
                    <DarkSelect label="Porte da empresa" value={companyProfile.size} onChange={(value) => setCompanyProfile({ ...companyProfile, size: value })} options={["MEI", "Microempresa", "EPP", "Demais empresas", "Outro"]} icon={Building2} />
                    <DarkSelect label="CAPAG" value={companyProfile.capag} onChange={(value) => setCompanyProfile({ ...companyProfile, capag: value })} options={["A", "B", "C", "D", "Não informada"]} />
                    <DarkSelect label="Existe impedimento para transação?" value={companyProfile.impediment} onChange={(value) => setCompanyProfile({ ...companyProfile, impediment: value })} options={["sim|Sim", "nao|Não", "nao_sei|Não sei"]} />
                    <div className="mt-1 rounded-xl border border-white/10 bg-black/8 p-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">Dívidas na PGFN</p>
                      <div className="grid gap-2">
                        <CompactDebtField label="Simples Nacional" value={debts.simples} onChange={(value) => updateDebt("simples", value)} />
                        <CompactDebtField label="Previdenciário" value={debts.previdenciario} onChange={(value) => updateDebt("previdenciario", value)} />
                        <CompactDebtField label="Tributário" value={debts.tributario} onChange={(value) => updateDebt("tributario", value)} />
                        <CompactDebtField label="Demais Débitos" value={debts.demais} onChange={(value) => updateDebt("demais", value)} />
                      </div>
                    </div>
                  </div>

                  <div className="grid content-start gap-3">
                    <div className="rounded-xl border border-white/10 bg-black/8 p-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">Débitos na Receita Federal</p>
                      <CompactDebtField label="Total em aberto" value={debts.rfb} onChange={(value) => updateDebt("rfb", value)} />
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/8 p-3">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">Situação atual</p>
                      <RadioOption label="Parcelamento inicial" checked={companyProfile.rfbSituation === "inicial"} onChange={() => setCompanyProfile({ ...companyProfile, rfbSituation: "inicial" })} />
                      <RadioOption label="Primeiro reparcelamento" checked={companyProfile.rfbSituation === "primeiro"} onChange={() => setCompanyProfile({ ...companyProfile, rfbSituation: "primeiro" })} />
                      <RadioOption label="Já houve reparcelamento anterior" checked={companyProfile.rfbSituation === "novo"} onChange={() => setCompanyProfile({ ...companyProfile, rfbSituation: "novo" })} />
                      <RadioOption label="Não sei" checked={companyProfile.rfbSituation === "nao_sei"} onChange={() => setCompanyProfile({ ...companyProfile, rfbSituation: "nao_sei" })} />
                    </div>
                    <DarkToggle label="Existe execução fiscal ativa?" value={companyProfile.enforcement} onChange={(value) => setCompanyProfile({ ...companyProfile, enforcement: value })} />
                    <DarkToggle label="Já ocorreu bloqueio ou penhora?" value={companyProfile.seizure} onChange={(value) => setCompanyProfile({ ...companyProfile, seizure: value })} />
                  </div>

                  <div className="flex flex-col rounded-2xl border border-white/10 bg-black/10 p-4">
                    <p className="text-sm font-semibold">Resultado preliminar</p>
                    <ResultRow label="Passivo federal informado" value={totalDebt > 0 ? formatCurrency(totalDebt) : "R$ —"} detail="valor consolidado" icon={FileSearch} />
                    <ResultRow label="Pressão financeira do cenário atual" value={totalDebt > 0 ? (rfbEntryRate > 0 ? "alto" : "em análise") : "—"} detail="baixo  •  médio  •  alto" icon={ShieldAlert} />
                    <ResultRow label="Possível cenário estratégico" value={totalDebt > 0 ? "analisar" : "—"} detail="negociação  •  parcelamento  •  transação" icon={Target} />
                    <ResultRow label="Atenção prioritária" value={hasPriority ? "sim" : "—"} detail="pontos de risco identificados" icon={ShieldCheck} />

                    {hasImpediment ? (
                      <div className="mb-3 rounded-xl border border-amber-300/35 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
                        <strong className="block text-sm">Transação restrita no cenário atual</strong>
                        Avaliar regularização, pagamento, garantia e revisão da situação.
                      </div>
                    ) : null}

                    {rfbEntry > 0 ? (
                      <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                        Impacto imediato estimado na RFB: <strong className="text-white">{formatCurrency(rfbEntry)}</strong>
                      </div>
                    ) : null}

                    <Link to="/app/diagnostico/novo" className="mt-auto inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[#1d76bd]/50 bg-[#125f98] px-4 text-sm font-bold text-white shadow-lg shadow-black/15 transition hover:bg-[#176ca9]">
                      VER RESUMO DO CENÁRIO <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </StrategicPanel>
            </section>

            <section className="flex flex-col gap-4 rounded-xl border border-[#d9e2dd] bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between md:px-7">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#c9d8d1] bg-white text-[#0b655b] shadow-md">
                  <Target className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-semibold text-[#102524]">Uma análise completa revela oportunidades que os números sozinhos não mostram.</h2>
                  <p className="mt-1 text-sm text-[#61736d]">Nossos especialistas combinam dados, legislação e estratégia para transformar risco em decisão e resultado.</p>
                </div>
              </div>
              <Link to="/app/diagnostico/novo" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#07534d] px-6 text-sm font-bold text-white shadow-lg shadow-[#07534d]/20 transition hover:bg-[#064640]">
                <Sparkles className="h-4 w-4" /> SOLICITAR ANÁLISE COMPLETA <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="grid gap-4 rounded-xl border border-[#e1e7e4] bg-[#fafbfa] p-4 lg:grid-cols-[170px_1fr]">
              <div className="px-1 py-2">
                <h2 className="font-serif text-2xl font-semibold leading-tight text-[#17302e]">Fique ligado<br />nas decisões</h2>
                <p className="mt-5 text-sm leading-6 text-[#61736d]">Acompanhe atualizações de fontes oficiais que impactam sua empresa.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {OFFICIAL_SOURCES.map((source) => (
                  <OfficialSourceCard key={source.name} source={source} />
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StrategicPanel({
  icon: Icon,
  title,
  description,
  tone,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: "green" | "blue";
  children: React.ReactNode;
}) {
  const background =
    tone === "green"
      ? "bg-[radial-gradient(circle_at_85%_18%,rgba(19,145,132,0.13),transparent_28%),linear-gradient(135deg,#073938,#07443e_60%,#063430)]"
      : "bg-[radial-gradient(circle_at_85%_18%,rgba(39,114,175,0.16),transparent_30%),linear-gradient(135deg,#07384a,#063f56_55%,#073147)]";

  return (
    <article className={`overflow-hidden rounded-xl border border-white/10 p-4 text-white shadow-xl shadow-[#102524]/18 md:p-5 ${background}`}>
      <div className="flex items-start gap-4 border-b border-white/10 pb-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#d0ad63]/70 text-[#d8aa51]">
          <Icon className="h-7 w-7" strokeWidth={1.7} />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-semibold leading-tight">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-white/72">{description}</p>
        </div>
      </div>
      <div className="pt-4">{children}</div>
    </article>
  );
}

function DarkField({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: LucideIcon;
}) {
  return (
    <label className="grid grid-cols-[minmax(125px,1fr)_minmax(145px,0.8fr)] items-center gap-3 text-sm text-white/88">
      <span className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-white/72" /> : null}
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-10 rounded-md border border-white/16 bg-black/8 px-3 text-right text-sm text-white outline-none placeholder:text-white/48 focus:border-[#d0ad63]/70"
      />
    </label>
  );
}

function DarkSelect({
  label,
  value,
  onChange,
  options,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon?: LucideIcon;
}) {
  return (
    <label className="grid gap-1.5 text-xs text-white/82">
      <span className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-white/65" /> : null}
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 rounded-md border border-white/16 bg-[#0a3b3c] px-3 text-sm text-white outline-none focus:border-[#d0ad63]/70"
      >
        <option value="">Selecione</option>
        {options.map((option) => {
          const [optionValue, optionLabel] = option.includes("|") ? option.split("|") : [option, option];
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
        })}
      </select>
    </label>
  );
}

function CompactDebtField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid grid-cols-[1fr_112px] items-center gap-2 text-xs text-white/84">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="R$ 0,00"
        className="min-h-9 rounded-md border border-white/16 bg-black/8 px-2 text-right text-xs text-white outline-none placeholder:text-white/48 focus:border-[#d0ad63]/70"
      />
    </label>
  );
}

function RadioOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-white/82 last:mb-0">
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-[#2fc2a9]" />
      {label}
    </label>
  );
}

function DarkToggle({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/8 p-3">
      <p className="mb-2 text-xs text-white/82">{label}</p>
      <div className="grid grid-cols-2 overflow-hidden rounded-md border border-white/14">
        <button type="button" onClick={() => onChange("nao")} className={`min-h-9 text-xs font-semibold ${value === "nao" ? "bg-[#0d7d71] text-white" : "text-white/70 hover:bg-white/5"}`}>Não</button>
        <button type="button" onClick={() => onChange("sim")} className={`min-h-9 border-l border-white/14 text-xs font-semibold ${value === "sim" ? "bg-[#0d7d71] text-white" : "text-white/70 hover:bg-white/5"}`}>Sim</button>
      </div>
    </div>
  );
}

function ResultRow({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start gap-3 border-b border-white/10 py-3 last:border-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-white/74" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs leading-5 text-white/82">{label}</span>
          <strong className="whitespace-nowrap text-base text-white">{value}</strong>
        </div>
        <p className="mt-0.5 text-right text-[10px] text-white/48">{detail}</p>
      </div>
    </div>
  );
}

function OfficialSourceCard({ source }: { source: OfficialSource }) {
  const Icon = source.icon;
  return (
    <a href={source.href} target="_blank" rel="noreferrer" className="flex min-h-[190px] flex-col rounded-xl border border-[#dfe5e2] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#a9c2b6] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg border border-[#dce7e2] bg-[#f6f9f7] text-[#0b5a51]">
          <Icon className="h-6 w-6" />
        </div>
        <span className="rounded-full border border-[#d8e4de] px-2 py-1 text-[9px] font-semibold text-[#0b5a51]">• Fonte oficial</span>
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold text-[#17302e]">{source.name}</h3>
      <p className="mt-2 flex-1 text-xs leading-5 text-[#61736d]">{source.description}</p>
      <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#0b5a51]">Ver atualizações <ArrowRight className="h-3.5 w-3.5" /></span>
    </a>
  );
}

function SideLink({ to, label, icon: Icon }: { to: string; label: string; icon: LucideIcon }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);
  return (
    <Link to={to} aria-label={label} title={label} className={`grid h-11 w-11 place-items-center rounded-lg transition ${active ? "bg-[#0c6a63] text-white shadow-inner" : "text-white/66 hover:bg-white/8 hover:text-white"}`}>
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
  if (monthlyRevenue <= 0) return "—%";
  return `${((monthlyTaxes / monthlyRevenue) * 100).toFixed(2).replace(".", ",")}%`;
}

function roleLabel(role: AuthorizedUser["role"]) {
  const labels: Record<AuthorizedUser["role"], string> = {
    owner: "Owner",
    admin: "Administrador",
    especialista: "Especialista",
    hunter: "Hunter",
    viewer: "Visualizador",
  };
  return labels[role];
}
