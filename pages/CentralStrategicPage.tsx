import { useEffect, useMemo, useState, type LucideIcon, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Target,
  UserCircle,
  Users,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { formatCurrency } from "@/lib/RiskCalculator";
import { getCurrentAuthorizedUser, listDiagnostics, type AuthorizedUser, type SavedDiagnostic } from "@/lib/storage";

const SOURCES = [
  { name: "Receita Federal", text: "Acompanhe normas, atos e orientações que impactam obrigações e regras tributárias.", href: "https://www.gov.br/receitafederal/pt-br", icon: Building2 },
  { name: "PGFN", text: "Fique por dentro de editais, transações, negociações e oportunidades de regularização.", href: "https://www.gov.br/pgfn/pt-br", icon: Scale },
  { name: "Ministério da Fazenda", text: "Acompanhe políticas, medidas e projetos que moldam o sistema tributário brasileiro.", href: "https://www.gov.br/fazenda/pt-br", icon: Landmark },
  { name: "IBS/CBS", text: "Novidades sobre o novo sistema de tributação sobre consumo e sua implementação.", href: "https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria", icon: Network },
];

type DebtKey = "simples" | "previdenciaria" | "tributaria" | "demais";

type PassivoForm = {
  size: "mei" | "me" | "epp" | "demais";
  capag: "A" | "B" | "C" | "D" | "nao_informada";
  impediment: "sim" | "nao" | "nao_sei";
  rfbSituation: "inicial" | "primeiro_reparcelamento" | "reparcelamento_anterior" | "nao_sei";
  execution: "sim" | "nao";
  seizure: "sim" | "nao";
  rfb: string;
  pgfn: Record<DebtKey, string>;
};

export function CentralStrategicPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthorizedUser | null>(null);
  const [items, setItems] = useState<SavedDiagnostic[]>([]);
  const [query, setQuery] = useState("");
  const [reform, setReform] = useState({ revenue: "", regime: "", activity: "", b2b: "", purchases: "", payroll: "", taxes: "" });
  const [passivo, setPassivo] = useState<PassivoForm>({
    size: "demais",
    capag: "nao_informada",
    impediment: "nao_sei",
    rfbSituation: "inicial",
    execution: "nao",
    seizure: "nao",
    rfb: "",
    pgfn: { simples: "", previdenciaria: "", tributaria: "", demais: "" },
  });

  useEffect(() => {
    getCurrentAuthorizedUser().then(setUser).catch(() => setUser(null));
    listDiagnostics().then(setItems).catch(() => setItems([]));
  }, []);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return items.filter((item) => [item.input.nomeEmpresa, item.input.cnpj, item.input.contato].join(" ").toLowerCase().includes(term)).slice(0, 5);
  }, [items, query]);

  const reformResult = useMemo(() => {
    const revenue = parseMoney(reform.revenue);
    const taxes = parseMoney(reform.taxes);
    const purchases = parseMoney(reform.purchases);
    const payroll = parseMoney(reform.payroll);
    const currentRate = revenue > 0 && taxes > 0 ? (taxes / revenue) * 100 : 0;
    const purchaseShare = revenue > 0 ? purchases / revenue : 0;
    const payrollShare = revenue > 0 ? payroll / revenue : 0;
    const b2b = Number(reform.b2b.replace(",", ".")) || 0;
    const pressure = revenue <= 0 ? "—" : payrollShare >= 0.35 || purchaseShare <= 0.1 ? "alto" : payrollShare >= 0.2 || b2b >= 60 ? "médio" : "a validar";
    return { currentRate, annualTaxes: taxes * 12, pressure };
  }, [reform]);

  const passivoResult = useMemo(() => {
    const pgfn = Object.values(passivo.pgfn).reduce((sum, value) => sum + parseMoney(value), 0);
    const rfb = parseMoney(passivo.rfb);
    const total = pgfn + rfb;
    const rfbEntry = passivo.rfbSituation === "primeiro_reparcelamento" ? rfb * 0.1 : passivo.rfbSituation === "reparcelamento_anterior" ? rfb * 0.2 : 0;
    const priority = passivo.execution === "sim" || passivo.seizure === "sim";
    const pressure = total <= 0 ? "—" : priority || rfbEntry > 0 ? "alto" : total > 1_000_000 ? "médio" : "em análise";
    return { pgfn, rfb, total, rfbEntry, priority, pressure };
  }, [passivo]);

  function setPgfn(key: DebtKey, value: string) {
    setPassivo((current) => ({ ...current, pgfn: { ...current.pgfn, [key]: value } }));
  }

  function openSimulator() {
    navigate("/app/simulador-passivo", {
      state: {
        seed: {
          companySize: passivo.size,
          capag: passivo.capag,
          impediment: passivo.impediment,
          executionActive: passivo.execution,
          seizureIdentified: passivo.seizure,
          rfbAmount: parseMoney(passivo.rfb),
          rfbSituation: passivo.rfbSituation,
          pgfnAmounts: Object.fromEntries(Object.entries(passivo.pgfn).map(([key, value]) => [key, parseMoney(value)])),
        },
      },
    });
  }

  const displayName = user?.nome || user?.email || "Usuário";

  return (
    <main className="min-h-screen bg-[#f5f6f5] text-[#102524]">
      <div className="grid min-h-screen lg:grid-cols-[68px_1fr]">
        <aside className="border-r border-white/10 bg-[#062c2e] text-white">
          <div className="flex h-full min-h-[70px] items-center justify-between px-3 py-4 lg:min-h-screen lg:flex-col">
            <div className="flex items-center gap-3 lg:flex-col lg:gap-5">
              <Link to="/app/inicio" aria-label="Radar Tributário"><BrandMark size="md" /></Link>
              <nav className="flex gap-2 lg:flex-col">
                <SideLink to="/app/inicio" icon={LayoutDashboard} label="Início" />
                <SideLink to="/app/pro" icon={BarChart3} label="Área Pro" />
                <SideLink to="/app/simulador-passivo" icon={Calculator} label="Simulador" />
              </nav>
            </div>
            <SideLink to="/admin/usuarios" icon={Settings} label="Configurações" />
          </div>
        </aside>

        <section className="min-w-0">
          <header className="bg-[radial-gradient(circle_at_42%_140%,rgba(15,107,95,.24),transparent_42%),linear-gradient(90deg,#05292b,#073638)] px-4 py-5 text-white sm:px-6 lg:px-7">
            <div className="mx-auto flex max-w-[1720px] flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h1 className="font-serif text-3xl font-semibold md:text-[40px]">Central Estratégica</h1>
                <p className="mt-1 max-w-xl text-sm leading-5 text-white/78">Descubra como as mudanças tributárias e o passivo federal podem afetar o caixa da sua empresa</p>
              </div>
              <div className="flex flex-col gap-3 xl:min-w-[720px] xl:flex-row xl:items-center">
                <div className="relative flex-1">
                  <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/15 bg-white/8 px-4 text-white/65">
                    <Search className="h-5 w-5" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empresa, CNPJ ou diagnóstico" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/55" />
                  </label>
                  {query.trim() ? (
                    <div className="absolute left-0 right-0 top-[54px] z-40 overflow-hidden rounded-xl border border-[#dce4e0] bg-white text-[#17302e] shadow-2xl">
                      {matches.length ? matches.map((item) => (
                        <Link key={item.id} to={`/app/empresas/${item.id}`} className="flex items-center justify-between border-b border-[#edf1ef] px-4 py-3 last:border-0 hover:bg-[#f3f7f5]">
                          <span><strong className="block text-sm">{item.input.nomeEmpresa}</strong><small className="text-[#71817b]">{item.input.cnpj || "CNPJ não informado"}</small></span>
                          <ArrowRight className="h-4 w-4 text-[#0b6a60]" />
                        </Link>
                      )) : <p className="p-4 text-sm text-[#71817b]">Nenhuma empresa encontrada.</p>}
                    </div>
                  ) : null}
                </div>
                <button type="button" className="relative grid h-11 w-11 place-items-center"><Bell className="h-5 w-5" /><span className="absolute right-0 top-0 rounded-full bg-[#0c8e81] px-1.5 text-[10px] font-bold">3</span></button>
                <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full border border-[#d8aa51]/35 bg-white/10"><UserCircle className="h-7 w-7 text-[#e8d6a8]" /></span><span><strong className="block max-w-44 truncate text-sm">{displayName}</strong><small className="text-white/55">{user ? roleLabel(user.role) : "Sessão ativa"}</small></span></div>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1720px] gap-4 px-2 py-3 sm:px-4">
            <section className="grid gap-3 2xl:grid-cols-2">
              <DarkPanel tone="green" icon={Scale} title="Como a Reforma pode afetar sua empresa?" description="Tenha uma visão preliminar de como a Reforma Tributária pode impactar seus custos, margem e caixa.">
                <div className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
                  <div className="grid content-start gap-3">
                    <DarkInput icon={CircleDollarSign} label="Faturamento mensal" value={reform.revenue} onChange={(value) => setReform({ ...reform, revenue: value })} placeholder="R$ 0,00" />
                    <DarkSelect icon={Calculator} label="Regime tributário" value={reform.regime} onChange={(value) => setReform({ ...reform, regime: value })} options={["Simples Nacional", "Lucro Presumido", "Lucro Real", "Outro"]} />
                    <DarkSelect icon={BriefcaseBusiness} label="Atividade principal" value={reform.activity} onChange={(value) => setReform({ ...reform, activity: value })} options={["Comércio", "Indústria", "Serviços", "Misto"]} />
                    <DarkInput icon={Network} label="Vendas B2B (%)" value={reform.b2b} onChange={(value) => setReform({ ...reform, b2b: value })} placeholder="Ex.: 60" suffix="%" />
                    <DarkInput icon={Building2} label="Compras e insumos mensais" value={reform.purchases} onChange={(value) => setReform({ ...reform, purchases: value })} placeholder="R$ 0,00" />
                    <DarkInput icon={Users} label="Folha de pagamento mensal" value={reform.payroll} onChange={(value) => setReform({ ...reform, payroll: value })} placeholder="R$ 0,00" />
                    <DarkInput icon={Calculator} label="Tributos pagos atualmente" value={reform.taxes} onChange={(value) => setReform({ ...reform, taxes: value })} placeholder="R$ 0,00" />
                  </div>
                  <ResultBox title="Resultado preliminar">
                    <ResultLine icon={CircleDollarSign} label="Carga atual estimada" value={reformResult.currentRate ? `${reformResult.currentRate.toFixed(2).replace(".", ",")}%` : "—%"} detail="sobre faturamento" />
                    <ResultLine icon={BarChart3} label="Carga projetada" value="—%" detail="depende da simulação completa" />
                    <ResultLine icon={CircleDollarSign} label="Possível impacto anual" value={reformResult.annualTaxes ? formatCurrency(reformResult.annualTaxes) : "R$ —"} detail="base atual informada" />
                    <ResultLine icon={FileSearch} label="Créditos estimados" value="R$ —" detail="potencial a validar" />
                    <ResultLine icon={Target} label="Pressão sobre margem" value={reformResult.pressure} detail="baixo • médio • alto" />
                    <Link to="/app/diagnostico/novo" className="mt-auto inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-[#16a896]/40 bg-[#0d7d71] px-4 text-sm font-bold text-white">VER ANÁLISE PRELIMINAR <ArrowRight className="h-4 w-4" /></Link>
                  </ResultBox>
                </div>
              </DarkPanel>

              <DarkPanel tone="blue" icon={Landmark} title="Entenda o peso atual das suas dívidas" description="Informe seus débitos federais para entender o impacto atual no seu caixa e os caminhos estratégicos disponíveis.">
                <div className="grid gap-4 xl:grid-cols-[.95fr_.9fr_.82fr]">
                  <div className="grid content-start gap-3">
                    <DarkSelect label="Porte da empresa" value={passivo.size} onChange={(value) => setPassivo({ ...passivo, size: value as PassivoForm["size"] })} options={["mei|MEI", "me|Microempresa", "epp|EPP", "demais|Demais empresas"]} />
                    <DarkSelect label="CAPAG" value={passivo.capag} onChange={(value) => setPassivo({ ...passivo, capag: value as PassivoForm["capag"] })} options={["A", "B", "C", "D", "nao_informada|Não informada"]} />
                    <DarkSelect label="Existe impedimento para transação?" value={passivo.impediment} onChange={(value) => setPassivo({ ...passivo, impediment: value as PassivoForm["impediment"] })} options={["sim|Sim", "nao|Não", "nao_sei|Não sei"]} />
                    <MiniBox title="Dívidas na PGFN">
                      <DebtInput label="Simples Nacional" value={passivo.pgfn.simples} onChange={(value) => setPgfn("simples", value)} />
                      <DebtInput label="Previdenciário" value={passivo.pgfn.previdenciaria} onChange={(value) => setPgfn("previdenciaria", value)} />
                      <DebtInput label="Tributário" value={passivo.pgfn.tributaria} onChange={(value) => setPgfn("tributaria", value)} />
                      <DebtInput label="Demais Débitos" value={passivo.pgfn.demais} onChange={(value) => setPgfn("demais", value)} />
                    </MiniBox>
                  </div>
                  <div className="grid content-start gap-3">
                    <MiniBox title="Débitos na Receita Federal"><DebtInput label="Total em aberto" value={passivo.rfb} onChange={(value) => setPassivo({ ...passivo, rfb: value })} /></MiniBox>
                    <MiniBox title="Situação atual">
                      <Radio label="Parcelamento inicial" checked={passivo.rfbSituation === "inicial"} onChange={() => setPassivo({ ...passivo, rfbSituation: "inicial" })} />
                      <Radio label="Primeiro reparcelamento" checked={passivo.rfbSituation === "primeiro_reparcelamento"} onChange={() => setPassivo({ ...passivo, rfbSituation: "primeiro_reparcelamento" })} />
                      <Radio label="Já houve reparcelamento anterior" checked={passivo.rfbSituation === "reparcelamento_anterior"} onChange={() => setPassivo({ ...passivo, rfbSituation: "reparcelamento_anterior" })} />
                      <Radio label="Não sei" checked={passivo.rfbSituation === "nao_sei"} onChange={() => setPassivo({ ...passivo, rfbSituation: "nao_sei" })} />
                    </MiniBox>
                    <Toggle label="Existe execução fiscal ativa?" value={passivo.execution} onChange={(value) => setPassivo({ ...passivo, execution: value })} />
                    <Toggle label="Já ocorreu bloqueio ou penhora?" value={passivo.seizure} onChange={(value) => setPassivo({ ...passivo, seizure: value })} />
                  </div>
                  <ResultBox title="Resultado preliminar">
                    <ResultLine icon={FileSearch} label="Passivo federal informado" value={passivoResult.total ? formatCurrency(passivoResult.total) : "R$ —"} detail="valor consolidado" />
                    <ResultLine icon={ShieldAlert} label="Pressão financeira do cenário atual" value={passivoResult.pressure} detail="baixo • médio • alto" />
                    <ResultLine icon={Target} label="Possível cenário estratégico" value={passivoResult.total ? "analisar" : "—"} detail="negociação • parcelamento • transação" />
                    <ResultLine icon={Scale} label="Atenção prioritária" value={passivoResult.priority ? "sim" : "—"} detail="pontos de risco identificados" />
                    {passivo.impediment === "sim" ? <div className="mb-3 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-100"><strong className="block">Transação indisponível no cenário atual</strong><span className="mt-1 block text-amber-100/75">Avaliar regularização possível e estratégia em duas etapas.</span></div> : null}
                    <button type="button" onClick={openSimulator} className="mt-auto inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-blue-300/25 bg-[#155b91] px-4 text-sm font-bold text-white">VER RESUMO DO CENÁRIO <ArrowRight className="h-4 w-4" /></button>
                  </ResultBox>
                </div>
              </DarkPanel>
            </section>

            <section className="flex flex-col gap-4 rounded-xl border border-[#dce4e0] bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#d5dfda] bg-white text-[#0b6a60] shadow"><Target className="h-7 w-7" /></span><div><h2 className="font-serif text-xl font-semibold text-[#17302e]">Uma análise completa revela oportunidades que os números sozinhos não mostram.</h2><p className="mt-1 text-sm text-[#61736d]">Nossos especialistas combinam dados, legislação e estratégia para transformar risco em decisão e resultado.</p></div></div>
              <Link to="/app/diagnostico/novo" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#07574f] px-6 text-sm font-bold text-white">SOLICITAR ANÁLISE COMPLETA <ArrowRight className="h-5 w-5" /></Link>
            </section>

            <section className="grid gap-4 rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm xl:grid-cols-[180px_1fr]">
              <div className="border-b border-[#e7ece9] pb-4 xl:border-b-0 xl:border-r xl:pr-5"><h2 className="font-serif text-2xl font-semibold leading-tight text-[#17302e]">Fique ligado<br />nas decisões</h2><p className="mt-5 text-sm leading-6 text-[#61736d]">Acompanhe atualizações de fontes oficiais que impactam sua empresa.</p></div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{SOURCES.map((source) => <SourceCard key={source.name} {...source} />)}</div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function DarkPanel({ tone, icon: Icon, title, description, children }: { tone: "green" | "blue"; icon: LucideIcon; title: string; description: string; children: ReactNode }) {
  const bg = tone === "green" ? "bg-[radial-gradient(circle_at_80%_22%,rgba(18,132,117,.18),transparent_38%),linear-gradient(135deg,#042e2f,#06433f)]" : "bg-[radial-gradient(circle_at_82%_20%,rgba(29,108,167,.22),transparent_38%),linear-gradient(135deg,#04313a,#053d55)]";
  return <article className={`relative overflow-hidden rounded-xl border border-white/10 p-4 text-white shadow-xl md:p-5 ${bg}`}><div className="absolute inset-0 opacity-[.06] [background-image:linear-gradient(rgba(255,255,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.18)_1px,transparent_1px)] [background-size:34px_34px]" /><div className="relative"><div className="mb-4 flex items-start gap-4 border-b border-white/10 pb-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#d8aa51]/70 text-[#d8aa51]"><Icon className="h-7 w-7" /></span><div><h2 className="font-serif text-2xl font-semibold">{title}</h2><p className="mt-1 text-sm leading-5 text-white/72">{description}</p></div></div>{children}</div></article>;
}

function DarkInput({ icon: Icon, label, value, onChange, placeholder, suffix }: { icon?: LucideIcon; label: string; value: string; onChange: (value: string) => void; placeholder: string; suffix?: string }) {
  return <label className="grid grid-cols-[minmax(125px,.9fr)_1.1fr] items-center gap-3 text-xs text-white/90"><span className="flex items-center gap-2">{Icon ? <Icon className="h-4 w-4 text-white/70" /> : null}{label}</span><span className="flex min-h-10 items-center rounded-lg border border-white/15 bg-black/10 px-3"><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-right text-sm text-white outline-none placeholder:text-white/45" />{suffix ? <span className="ml-2 text-white/55">{suffix}</span> : null}</span></label>;
}

function DarkSelect({ icon: Icon, label, value, onChange, options }: { icon?: LucideIcon; label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="grid grid-cols-[minmax(125px,.9fr)_1.1fr] items-center gap-3 text-xs text-white/90"><span className="flex items-center gap-2">{Icon ? <Icon className="h-4 w-4 text-white/70" /> : null}{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-10 rounded-lg border border-white/15 bg-black/10 px-3 text-sm text-white outline-none [color-scheme:dark]"><option value="">Selecione</option>{options.map((option) => { const [v, l] = option.includes("|") ? option.split("|") : [option, option]; return <option key={v} value={v}>{l}</option>; })}</select></label>;
}

function MiniBox({ title, children }: { title: string; children: ReactNode }) { return <div className="rounded-xl border border-white/10 bg-black/8 p-3"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.12em] text-white/80">{title}</p><div className="grid gap-2">{children}</div></div>; }
function DebtInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="grid grid-cols-[1fr_112px] items-center gap-3 text-xs text-white/88"><span>{label}</span><span className="flex min-h-9 items-center rounded-lg border border-white/15 bg-black/10 px-2"><span className="mr-1 text-white/45">R$</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder="0,00" className="min-w-0 flex-1 bg-transparent text-right text-xs text-white outline-none placeholder:text-white/40" /></span></label>; }
function Radio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) { return <label className="flex cursor-pointer items-center gap-2 text-xs text-white/84"><input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-[#38c6a8]" />{label}</label>; }
function Toggle({ label, value, onChange }: { label: string; value: "sim" | "nao"; onChange: (value: "sim" | "nao") => void }) { return <div className="rounded-xl border border-white/10 bg-black/8 p-3"><p className="mb-2 text-xs text-white/88">{label}</p><div className="grid grid-cols-2 overflow-hidden rounded-lg border border-white/15"><button type="button" onClick={() => onChange("nao")} className={`min-h-9 text-xs font-semibold ${value === "nao" ? "bg-[#0f7167] text-white" : "bg-black/10 text-white/60"}`}>Não</button><button type="button" onClick={() => onChange("sim")} className={`min-h-9 border-l border-white/15 text-xs font-semibold ${value === "sim" ? "bg-[#0f7167] text-white" : "bg-black/10 text-white/60"}`}>Sim</button></div></div>; }
function ResultBox({ title, children }: { title: string; children: ReactNode }) { return <div className="flex min-h-[390px] flex-col rounded-xl border border-white/10 bg-black/10 p-4"><p className="text-sm font-semibold">{title}</p><div className="mt-2 grid flex-1">{children}</div></div>; }
function ResultLine({ icon: Icon, label, value, detail }: { icon: LucideIcon; label: string; value: string; detail: string }) { return <div className="grid grid-cols-[26px_1fr_auto] items-center gap-2 border-b border-white/10 py-3"><Icon className="h-4 w-4 text-white/72" /><span><span className="block text-xs text-white/88">{label}</span><small className="text-[10px] text-white/45">{detail}</small></span><strong className="text-right text-base">{value}</strong></div>; }
function SourceCard({ name, text, href, icon: Icon }: { name: string; text: string; href: string; icon: LucideIcon }) { return <a href={href} target="_blank" rel="noreferrer" className="group flex min-h-[210px] flex-col rounded-xl border border-[#e0e6e3] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-lg bg-[#f2f6f4] text-[#0b6158]"><Icon className="h-6 w-6" /></span><span className="rounded-full border border-[#d6e1dc] px-2 py-1 text-[9px] text-[#547069]">● Fonte oficial</span></div><h3 className="mt-4 font-serif text-lg font-semibold text-[#17302e]">{name}</h3><p className="mt-2 flex-1 text-sm leading-5 text-[#61736d]">{text}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#0b6158]">Ver atualizações <ArrowRight className="h-4 w-4" /></span></a>; }
function SideLink({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) { const location = useLocation(); const active = location.pathname === to || location.pathname.startsWith(`${to}/`); return <Link to={to} title={label} aria-label={label} className={`grid h-11 w-11 place-items-center rounded-lg ${active ? "bg-[#0b7168] text-white" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><Icon className="h-5 w-5" /></Link>; }
function parseMoney(value: string) { const clean = value.replace(/[^0-9,.-]/g, ""); return clean.includes(",") ? Number(clean.replace(/\./g, "").replace(",", ".")) || 0 : Number(clean) || 0; }
function roleLabel(role: AuthorizedUser["role"]) { return ({ owner: "Administrador", admin: "Administrador", especialista: "Especialista", hunter: "Consultor", viewer: "Visualizador" } as Record<AuthorizedUser["role"], string>)[role]; }
