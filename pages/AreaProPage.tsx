import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckSquare,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Filter,
  LayoutDashboard,
  Search,
  Settings,
  Target,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { formatCurrency } from "@/lib/RiskCalculator";
import { calculateCrmInsights } from "@/lib/crm";
import { getCurrentAuthorizedUser, listDiagnostics, type AuthorizedUser, type SavedDiagnostic } from "@/lib/storage";

type StageId = "novo" | "contato" | "reuniao" | "diagnostico" | "estrategia" | "proposta" | "negociacao" | "contratado" | "perdido";
type Stage = { id: StageId; label: string; tone?: "green" | "red" };

const STAGES: Stage[] = [
  { id: "novo", label: "Novo Lead" },
  { id: "contato", label: "Contato realizado" },
  { id: "reuniao", label: "Reunião agendada" },
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "estrategia", label: "Estratégia definida" },
  { id: "proposta", label: "Proposta enviada" },
  { id: "negociacao", label: "Negociação" },
  { id: "contratado", label: "Contratado", tone: "green" },
  { id: "perdido", label: "Perdido", tone: "red" },
];

export function AreaProPage() {
  const [items, setItems] = useState<SavedDiagnostic[]>([]);
  const [user, setUser] = useState<AuthorizedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    Promise.all([
      listDiagnostics().then(setItems).catch(() => setItems([])),
      getCurrentAuthorizedUser().then(setUser).catch(() => setUser(null)),
    ]).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.input.nomeEmpresa, item.input.cnpj, item.input.contato, item.crm?.owner, item.crm?.nextAction]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, query]);

  const stats = useMemo(() => {
    const companies = new Set(items.map((item) => item.input.cnpj || item.input.nomeEmpresa || item.id)).size;
    const open = items.filter((item) => !["contratado", "perdido"].includes(stageOf(item))).length;
    const value = items.reduce((sum, item) => {
      const proposal = (item.crm?.proposal.setupFee || 0) + (item.crm?.proposal.monthlyFee || 0) * 12;
      return sum + Math.max(calculateCrmInsights(item.crm!).totalDebt, proposal);
    }, 0);
    return {
      companies,
      open,
      value,
      pending: items.filter((item) => ["diagnostico", "estrategia"].includes(stageOf(item))).length,
      proposals: items.filter((item) => ["proposta", "negociacao"].includes(stageOf(item))).length,
      overdue: items.filter(isOverdue).length,
    };
  }, [items]);

  const tasks = useMemo(
    () => [...items].filter((item) => item.crm?.nextAction).sort(byNextAction).slice(0, 5),
    [items],
  );
  const overdue = useMemo(() => items.filter(isOverdue).sort(byNextAction).slice(0, 5), [items]);
  const recent = useMemo(
    () => [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
    [items],
  );

  return (
    <main className="min-h-screen bg-[#f6f7f6] text-[#102524]">
      <div className="grid min-h-screen lg:grid-cols-[220px_1fr]">
        <Sidebar user={user} overdue={stats.overdue} />

        <section className="min-w-0">
          <header className="border-b border-[#e2e7e4] bg-white px-4 py-5 sm:px-6 lg:px-7">
            <div className="mx-auto flex max-w-[1760px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#17302e] md:text-[38px]">Área Pro</h1>
                  <span className="rounded-full border border-[#c8d8d0] bg-[#edf4f1] px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-[#0b5a51]">CRM interno</span>
                </div>
                <p className="mt-1 text-sm text-[#61736d]">Gestão comercial, estratégica e operacional dos clientes</p>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#d7dfdb] bg-white px-4 text-[#70817b] shadow-sm xl:w-[470px]">
                  <Search className="h-5 w-5" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar empresa, CNPJ, contato ou oportunidade" className="w-full bg-transparent text-sm text-[#102524] outline-none" />
                </label>
                <Link to="/app/diagnostico/novo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#073f3b] px-5 text-sm font-bold text-white shadow-lg shadow-[#073f3b]/15">
                  <Building2 className="h-4 w-4" /> Nova empresa
                </Link>
                <Link to="/app/diagnostico/novo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#e8b33f] px-5 text-sm font-bold text-[#362a12] shadow-lg shadow-[#e8b33f]/18">
                  <BriefcaseBusiness className="h-4 w-4" /> Nova oportunidade
                </Link>
                <button type="button" className="relative grid h-11 w-11 place-items-center text-[#526660]" aria-label="Notificações">
                  <Bell className="h-5 w-5" />
                  {stats.overdue > 0 ? <span className="absolute right-0 top-0 rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white">{stats.overdue}</span> : null}
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1760px] px-4 py-5 sm:px-6 lg:px-7">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <Kpi icon={Building2} label="Empresas ativas" value={String(stats.companies)} detail="Base empresarial" />
              <Kpi icon={Filter} label="Oportunidades abertas" value={String(stats.open)} detail="Esteira comercial" />
              <Kpi icon={CircleDollarSign} label="Valor em negociação" value={compactMoney(stats.value)} detail="Potencial mapeado" />
              <Kpi icon={ClipboardList} label="Diagnósticos pendentes" value={String(stats.pending)} detail="Em análise" accent="gold" />
              <Kpi icon={FileText} label="Propostas abertas" value={String(stats.proposals)} detail="Aguardando decisão" />
              <Kpi icon={AlertCircle} label="Tarefas vencidas" value={String(stats.overdue)} detail="Ver prioridades" accent="red" />
            </section>

            <section className="mt-4 overflow-hidden rounded-xl border border-[#e0e5e2] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#e7ebe9] px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold text-[#17302e]">Pipeline de oportunidades</h2>
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-[#c8d5cf] text-[10px] font-bold text-[#6c7f77]">i</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#d6dfda] px-3 text-xs font-semibold text-[#526660]"><Users className="h-4 w-4" /> Todos os consultores</button>
                  <button type="button" className="inline-flex min-h-9 items-center rounded-lg border border-[#d6dfda] px-3 text-xs font-semibold text-[#526660]">Ordenar por: Próxima ação</button>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b5a51] text-white"><LayoutDashboard className="h-4 w-4" /></button>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d6dfda] text-[#526660]"><Filter className="h-4 w-4" /></button>
                </div>
              </div>
              {loading ? <div className="p-8 text-sm text-[#61736d]">Carregando dados do CRM...</div> : <Pipeline items={filtered} />}
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr_.95fr_.9fr]">
              <Panel title="Atividades e prioridades">
                <div className="grid grid-cols-3 gap-2">
                  <Activity icon={CalendarDays} label="Hoje" value={tasks.filter((item) => isToday(item.crm?.nextActionDate)).length} />
                  <Activity icon={CheckSquare} label="Pendentes" value={tasks.length} />
                  <Activity icon={AlertCircle} label="Vencidas" value={stats.overdue} alert />
                </div>
                <Link to="/app/pro" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#0b6a60]">Ver todas as atividades <ArrowRight className="h-4 w-4" /></Link>
              </Panel>
              <Panel title="Tarefas de hoje" action="Ver agenda">
                <List items={tasks} empty="Nenhuma tarefa registrada." render={(item) => <TaskRow item={item} />} />
              </Panel>
              <Panel title="Ações atrasadas" action="Priorizar agora" alert>
                <List items={overdue} empty="Nenhuma ação vencida." render={(item) => <OverdueRow item={item} />} />
              </Panel>
              <Panel title="Empresas recentes" action="Ver todas">
                <List items={recent} empty="Nenhuma empresa registrada." render={(item) => <RecentRow item={item} />} />
              </Panel>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Pipeline({ items }: { items: SavedDiagnostic[] }) {
  return (
    <div className="overflow-x-auto p-3">
      <div className="grid min-w-[1860px] grid-cols-9 gap-2">
        {STAGES.map((stage) => {
          const stageItems = items.filter((item) => stageOf(item) === stage.id);
          const total = stageItems.reduce((sum, item) => sum + calculateCrmInsights(item.crm!).totalDebt, 0);
          const titleTone = stage.tone === "green" ? "text-[#0b7a62]" : stage.tone === "red" ? "text-[#8b5555]" : "text-[#17302e]";
          return (
            <article key={stage.id} className="min-h-[420px] rounded-lg border border-[#e1e6e3] bg-[#fafbfa]">
              <div className="border-b border-[#e4e9e6] px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs font-bold ${titleTone}`}>{stage.label}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#6d7e78]">{stageItems.length}</span>
                </div>
                <p className="mt-1 text-[10px] text-[#7d8b86]">{formatCurrency(total)}</p>
              </div>
              <div className="grid gap-2 p-2">
                {stageItems.map((item) => <PipelineCard key={item.id} item={item} />)}
                {stageItems.length === 0 ? <div className="rounded-md border border-dashed border-[#d9e1dd] bg-white/55 p-3 text-center text-[10px] text-[#98a49f]">Sem oportunidades</div> : null}
              </div>
              <div className="px-3 pb-3 pt-1 text-[10px] font-semibold text-[#61736d]">+ Adicionar oportunidade</div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PipelineCard({ item }: { item: SavedDiagnostic }) {
  const insight = calculateCrmInsights(item.crm!);
  const crm = item.crm!;
  return (
    <Link to={`/app/empresas/${item.id}`} className="block rounded-md border border-[#dde4e0] bg-white p-3 shadow-sm transition hover:border-[#8eb2a3] hover:shadow-md">
      <p className="line-clamp-2 text-xs font-bold leading-4 text-[#17302e]">{item.input.nomeEmpresa || "Empresa sem nome"}</p>
      <p className="mt-1 text-[9px] text-[#7c8984]">{item.input.cnpj || "CNPJ não informado"}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-[#e7f2ec] px-2 py-0.5 text-[9px] font-semibold text-[#0b6a5d]">{regimeLabel(item.input.regimeTributario)}</span>
        {insight.totalDebt > 0 ? <span className="rounded-full bg-[#f8eed6] px-2 py-0.5 text-[9px] font-semibold text-[#9b7226]">Passivo</span> : null}
      </div>
      <div className="mt-3 border-t border-[#eef1ef] pt-2">
        <p className="text-[9px] text-[#87938f]">Valor mapeado</p>
        <p className="mt-0.5 text-xs font-bold text-[#17302e]">{formatCurrency(insight.totalDebt)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between text-[9px] text-[#72817c]">
        <span>{crm.owner || "Sem responsável"}</span>
        <span>{crm.nextActionDate ? shortDate(crm.nextActionDate) : "Sem data"}</span>
      </div>
    </Link>
  );
}

function Sidebar({ user, overdue }: { user: AuthorizedUser | null; overdue: number }) {
  const links: { to: string; icon: LucideIcon; label: string; active?: boolean; badge?: number }[] = [
    { to: "/app/inicio", icon: LayoutDashboard, label: "Início" },
    { to: "/app/pro", icon: BriefcaseBusiness, label: "Área Pro", active: true },
    { to: "/app/pro", icon: Building2, label: "Empresas" },
    { to: "/app/pro", icon: Filter, label: "Pipeline" },
    { to: "/app/pro", icon: ClipboardList, label: "Tarefas", badge: overdue },
    { to: "/app/pro", icon: Target, label: "Operações" },
    { to: "/app/pro", icon: WalletCards, label: "Financeiro" },
    { to: "/app/pro", icon: BarChart3, label: "Relatórios" },
  ];
  const name = user?.nome || user?.email || "Usuário";
  return (
    <aside className="flex min-h-screen flex-col bg-[#062c2e] px-4 py-5 text-white">
      <Link to="/app/inicio" className="flex items-center gap-3">
        <BrandMark />
        <span><strong className="block font-serif text-lg">Radar Tributário</strong><small className="uppercase tracking-[.14em] text-white/45">Inteligência empresarial</small></span>
      </Link>
      <nav className="mt-8 grid gap-1">
        {links.map((item, index) => (
          <Link key={`${item.label}-${index}`} to={item.to} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-xs font-semibold ${item.active ? "bg-[#0c5f58] text-white" : "text-white/68 hover:bg-white/8 hover:text-white"}`}>
            <item.icon className="h-4 w-4" /><span className="flex-1">{item.label}</span>
            {item.badge ? <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold">{item.badge}</span> : null}
          </Link>
        ))}
      </nav>
      <Link to="/admin/usuarios" className="mt-6 flex min-h-10 items-center gap-3 border-t border-white/10 px-3 pt-4 text-xs font-semibold text-white/68 hover:text-white"><Settings className="h-4 w-4" /> Configurações</Link>
      <div className="mt-auto hidden items-center gap-3 border-t border-white/10 pt-5 lg:flex">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><Users className="h-5 w-5 text-[#e4c780]" /></span>
        <span className="min-w-0"><strong className="block truncate text-xs">{name}</strong><small className="text-white/45">{user ? roleLabel(user.role) : "Sessão ativa"}</small></span>
      </div>
    </aside>
  );
}

function Panel({ title, children, action, alert = false }: { title: string; children: ReactNode; action?: string; alert?: boolean }) {
  return <article className={`rounded-xl border bg-white p-4 shadow-sm ${alert ? "border-red-200" : "border-[#e0e5e2]"}`}><div className="flex items-center justify-between gap-3"><h2 className="font-serif text-lg font-semibold text-[#17302e]">{title}</h2>{action ? <span className={`text-[10px] font-bold ${alert ? "text-red-600" : "text-[#0b6a60]"}`}>{action}</span> : null}</div><div className="mt-3">{children}</div></article>;
}
function Activity({ icon: Icon, label, value, alert = false }: { icon: LucideIcon; label: string; value: number; alert?: boolean }) {
  return <div className="rounded-lg border border-[#e5eae7] p-3 text-center"><Icon className={`mx-auto h-6 w-6 ${alert ? "text-red-500" : "text-[#0b6a60]"}`} /><p className="mt-2 text-[9px] text-[#70817b]">{label}</p><p className="mt-1 font-serif text-2xl font-semibold text-[#17302e]">{value}</p></div>;
}
function List({ items, empty, render }: { items: SavedDiagnostic[]; empty: string; render: (item: SavedDiagnostic) => ReactNode }) {
  return <div className="divide-y divide-[#edf1ef]">{items.length ? items.map(render) : <p className="py-5 text-center text-xs text-[#8a9994]">{empty}</p>}</div>;
}
function TaskRow({ item }: { item: SavedDiagnostic }) {
  return <Link to={`/app/empresas/${item.id}`} className="flex items-start gap-3 py-2.5 first:pt-0"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f3ee] text-[#0b6a60]"><CheckSquare className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#405550]">{item.crm?.nextAction || "Definir próxima ação"}</strong><small className="block truncate text-[9px] text-[#81908b]">{item.input.nomeEmpresa}</small></span><small className="text-[9px] font-bold text-[#0b6a60]">{item.crm?.nextActionDate ? shortDate(item.crm.nextActionDate) : "—"}</small></Link>;
}
function OverdueRow({ item }: { item: SavedDiagnostic }) {
  return <Link to={`/app/empresas/${item.id}`} className="flex items-start gap-3 py-2.5 first:pt-0"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-50 text-red-500"><AlertCircle className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#405550]">{item.crm?.nextAction || "Ação pendente"}</strong><small className="block truncate text-[9px] text-[#81908b]">{item.input.nomeEmpresa}</small></span><small className="text-[9px] font-bold text-red-600">vencida</small></Link>;
}
function RecentRow({ item }: { item: SavedDiagnostic }) {
  return <Link to={`/app/empresas/${item.id}`} className="flex items-center gap-3 py-2.5 first:pt-0"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef3f1] text-[#61736d]"><Building2 className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#405550]">{item.input.nomeEmpresa}</strong><small className="block truncate text-[9px] text-[#81908b]">{item.input.cnpj || "CNPJ não informado"}</small></span><span className="rounded bg-[#e8f3ee] px-2 py-1 text-[8px] font-semibold text-[#0b6a60]">{stageLabel(stageOf(item))}</span></Link>;
}
function Kpi({ icon: Icon, label, value, detail, accent = "green" }: { icon: LucideIcon; label: string; value: string; detail: string; accent?: "green" | "gold" | "red" }) {
  const tone = accent === "gold" ? "bg-[#eeb331]" : accent === "red" ? "bg-[#e95a42]" : "bg-[#08736a]";
  return <article className="rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className={`grid h-11 w-11 place-items-center rounded-full text-white ${tone}`}><Icon className="h-5 w-5" /></span><span className="min-w-0"><small className="block truncate text-[10px] font-semibold text-[#61736d]">{label}</small><strong className="mt-0.5 block truncate text-xl text-[#17302e]">{value}</strong></span></div><p className={`mt-3 text-[10px] ${accent === "red" ? "text-red-600" : accent === "gold" ? "text-[#af7c17]" : "text-[#17846f]"}`}>{detail}</p></article>;
}

function stageOf(item: SavedDiagnostic): StageId {
  const crm = item.crm!;
  if (item.status === "perdido" || crm.stage === "perdido" || crm.financial.dealStatus === "perdido") return "perdido";
  if (crm.stage === "cliente" || crm.financial.dealStatus === "ganho") return "contratado";
  if (item.status === "proposta_enviada" || crm.financial.dealStatus === "proposta") return "negociacao";
  if (item.status === "parecer_emitido" || crm.stage === "proposta") return "proposta";
  if (item.status === "aguardando_documentos" || item.status === "em_analise_especialista" || crm.stage === "documentos") return "estrategia";
  if (item.status === "diagnostico_basico" || crm.stage === "diagnostico") return "diagnostico";
  const action = (crm.nextAction || "").toLowerCase();
  if (action.includes("reuni")) return "reuniao";
  if (crm.stage === "qualificado" || action.includes("contato") || action.includes("retorno")) return "contato";
  return "novo";
}
function isOverdue(item: SavedDiagnostic) {
  const date = item.crm?.nextActionDate;
  if (!date || ["contratado", "perdido"].includes(stageOf(item))) return false;
  return new Date(`${date}T23:59:59`).getTime() < Date.now();
}
function byNextAction(a: SavedDiagnostic, b: SavedDiagnostic) { return (a.crm?.nextActionDate || "9999-12-31").localeCompare(b.crm?.nextActionDate || "9999-12-31"); }
function isToday(value?: string) { return value === new Date().toISOString().slice(0, 10); }
function compactMoney(value: number) { if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(2).replace(".", ",")} bi`; if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(2).replace(".", ",")} mi`; if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(1).replace(".", ",")} mil`; return formatCurrency(value); }
function shortDate(value: string) { const [year, month, day] = value.slice(0, 10).split("-"); return year && month && day ? `${day}/${month}` : value; }
function regimeLabel(value: string) { return ({ simples: "Simples", presumido: "Lucro Presumido", real: "Lucro Real", mei: "MEI", nao_sei: "Regime não informado" } as Record<string, string>)[value] ?? value; }
function stageLabel(value: StageId) { return STAGES.find((stage) => stage.id === value)?.label ?? value; }
function roleLabel(role: AuthorizedUser["role"]) { return ({ owner: "Administrador", admin: "Administrador", especialista: "Especialista", hunter: "Consultor", viewer: "Visualizador" } as Record<AuthorizedUser["role"], string>)[role]; }
