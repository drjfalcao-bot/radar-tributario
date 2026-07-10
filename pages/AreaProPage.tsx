import { useEffect, useMemo, useState, type LucideIcon } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckSquare,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Filter,
  LayoutDashboard,
  ListTodo,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Users,
  WalletCards,
} from "lucide-react";
import { formatCurrency } from "@/lib/RiskCalculator";
import { calculateCrmInsights } from "@/lib/crm";
import { listDiagnostics, type DiagnosticStatus, type SavedDiagnostic } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

type PipelineStage = {
  id: string;
  label: string;
  statuses: DiagnosticStatus[];
  tone?: "default" | "success" | "lost";
};

const PIPELINE_STAGES: PipelineStage[] = [
  { id: "novo", label: "Novo Lead", statuses: ["lead_parcial"] },
  { id: "contato", label: "Contato realizado", statuses: [] },
  { id: "reuniao", label: "Reunião agendada", statuses: [] },
  { id: "diagnostico", label: "Diagnóstico", statuses: ["diagnostico_basico"] },
  { id: "estrategia", label: "Estratégia definida", statuses: ["aguardando_documentos", "em_analise_especialista"] },
  { id: "proposta", label: "Proposta enviada", statuses: ["parecer_emitido"] },
  { id: "negociacao", label: "Negociação", statuses: ["proposta_enviada"] },
  { id: "contratado", label: "Contratado", statuses: [], tone: "success" },
  { id: "perdido", label: "Perdido", statuses: ["perdido"], tone: "lost" },
];

const STATUS_LABELS: Record<DiagnosticStatus, string> = {
  lead_parcial: "Novo lead",
  diagnostico_basico: "Diagnóstico",
  aguardando_documentos: "Aguardando documentos",
  em_analise_especialista: "Estratégia em análise",
  parecer_emitido: "Parecer emitido",
  proposta_enviada: "Em negociação",
  perdido: "Perdido",
};

export function AreaProPage() {
  const [items, setItems] = useState<SavedDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listDiagnostics()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.input.nomeEmpresa, item.input.cnpj, item.input.contato, item.status]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, query]);

  const stats = useMemo(() => {
    const insights = items.map((item) => calculateCrmInsights(item.crm!));
    const companies = new Set(items.map((item) => item.input.cnpj || item.input.nomeEmpresa)).size;
    const open = items.filter((item) => item.status !== "perdido").length;
    const value = insights.reduce((sum, item) => sum + item.totalDebt + item.annualRevenue * 0.015, 0);
    const pendingDiagnostics = items.filter((item) => item.status === "diagnostico_basico" || item.status === "em_analise_especialista").length;
    const proposals = items.filter((item) => item.status === "parecer_emitido" || item.status === "proposta_enviada").length;
    const urgent = insights.filter((item) => item.priorityScore >= 70).length;
    return { companies, open, value, pendingDiagnostics, proposals, urgent };
  }, [items]);

  const recentItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [items],
  );

  const urgentItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => calculateCrmInsights(b.crm!).priorityScore - calculateCrmInsights(a.crm!).priorityScore)
        .filter((item) => calculateCrmInsights(item.crm!).priorityScore >= 70)
        .slice(0, 4),
    [items],
  );

  return (
    <main className="min-h-screen bg-[#f6f7f6] text-[#102524]">
      <div className="grid min-h-screen lg:grid-cols-[220px_1fr]">
        <ProSidebar />

        <section className="min-w-0">
          <header className="border-b border-[#e2e7e4] bg-white px-4 py-5 sm:px-6 lg:px-7">
            <div className="mx-auto flex max-w-[1760px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#17302e] md:text-[38px]">Área Pro</h1>
                  <span className="rounded-full border border-[#c8d8d0] bg-[#edf4f1] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0b5a51]">CRM interno</span>
                </div>
                <p className="mt-1 text-sm text-[#61736d]">Gestão comercial, estratégica e operacional dos clientes</p>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                <label className="flex min-h-12 min-w-0 items-center gap-3 rounded-xl border border-[#d7dfdb] bg-white px-4 text-sm text-[#70817b] shadow-sm xl:w-[470px]">
                  <Search className="h-5 w-5" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full border-0 bg-transparent text-[#102524] outline-none"
                    placeholder="Buscar empresa, CNPJ, contato ou oportunidade"
                  />
                </label>
                <Link to="/app/diagnostico/novo" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#073f3b] px-5 text-sm font-bold text-white shadow-lg shadow-[#073f3b]/16">
                  <Building2 className="h-4 w-4" /> Nova empresa
                </Link>
                <button type="button" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#e8b33f] px-5 text-sm font-bold text-[#362a12] shadow-lg shadow-[#e8b33f]/18">
                  <BriefcaseBusiness className="h-4 w-4" /> Nova oportunidade
                </button>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1760px] px-4 py-5 sm:px-6 lg:px-7">
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <KpiCard icon={Building2} label="Empresas ativas" value={String(stats.companies)} detail="Base empresarial" />
              <KpiCard icon={Filter} label="Oportunidades abertas" value={String(stats.open)} detail="Esteira comercial" />
              <KpiCard icon={CircleDollarSign} label="Valor em negociação" value={formatCurrency(stats.value)} detail="Potencial mapeado" />
              <KpiCard icon={ClipboardList} label="Diagnósticos pendentes" value={String(stats.pendingDiagnostics)} detail="Em análise" accent="gold" />
              <KpiCard icon={FileText} label="Propostas abertas" value={String(stats.proposals)} detail="Aguardando decisão" />
              <KpiCard icon={AlertCircle} label="Tarefas vencidas" value={String(stats.urgent)} detail="Ver prioridades" accent="red" />
            </section>

            <section className="mt-4 rounded-xl border border-[#e0e5e2] bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-[#e7ebe9] px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl font-semibold text-[#17302e]">Pipeline de oportunidades</h2>
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-[#c8d5cf] text-[10px] font-bold text-[#6c7f77]">i</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#d6dfda] bg-white px-3 text-xs font-semibold text-[#526660]"><Users className="h-4 w-4" /> Todos os consultores</button>
                  <button type="button" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#d6dfda] bg-white px-3 text-xs font-semibold text-[#526660]">Ordenar por: Próxima ação</button>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-lg bg-[#0b5a51] text-white"><LayoutDashboard className="h-4 w-4" /></button>
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d6dfda] text-[#526660]"><Filter className="h-4 w-4" /></button>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-sm text-[#61736d]">Carregando dados do CRM...</div>
              ) : (
                <PipelineBoard items={filtered} />
              )}
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr_0.95fr_0.9fr]">
              <ActivityOverview items={items} urgent={stats.urgent} />
              <TodayTasks items={items} />
              <OverdueActions items={urgentItems} />
              <RecentCompanies items={recentItems} />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function PipelineBoard({ items }: { items: SavedDiagnostic[] }) {
  return (
    <div className="overflow-x-auto p-3">
      <div className="grid min-w-[1860px] grid-cols-9 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const stageItems = items.filter((item) => stage.statuses.includes(item.status));
          const stageValue = stageItems.reduce((sum, item) => sum + calculateCrmInsights(item.crm!).totalDebt, 0);
          const titleTone = stage.tone === "success" ? "text-[#0b7a62]" : stage.tone === "lost" ? "text-[#8b5555]" : "text-[#17302e]";

          return (
            <article key={stage.id} className="min-h-[420px] rounded-lg border border-[#e1e6e3] bg-[#fafbfa]">
              <div className="border-b border-[#e4e9e6] px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs font-bold ${titleTone}`}>{stage.label}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#6d7e78]">{stageItems.length}</span>
                </div>
                <p className="mt-1 text-[10px] text-[#7d8b86]">{formatCurrency(stageValue)}</p>
              </div>
              <div className="grid gap-2 p-2">
                {stageItems.map((item) => <PipelineCard key={item.id} item={item} />)}
                {stageItems.length === 0 ? (
                  <div className="rounded-md border border-dashed border-[#d9e1dd] bg-white/55 p-3 text-center text-[10px] text-[#98a49f]">Sem oportunidades</div>
                ) : null}
              </div>
              <div className="mt-auto px-3 pb-3 pt-1 text-[10px] font-semibold text-[#61736d]">+ Adicionar oportunidade</div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PipelineCard({ item }: { item: SavedDiagnostic }) {
  const insights = calculateCrmInsights(item.crm!);
  return (
    <Link to={`/app/leads/${item.id}`} className="block rounded-md border border-[#dde4e0] bg-white p-3 shadow-sm transition hover:border-[#8eb2a3] hover:shadow-md">
      <p className="line-clamp-2 text-xs font-bold leading-4 text-[#17302e]">{item.input.nomeEmpresa || "Empresa sem nome"}</p>
      <p className="mt-1 text-[9px] text-[#7c8984]">{item.input.cnpj || "CNPJ não informado"}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="rounded-full bg-[#e7f2ec] px-2 py-0.5 text-[9px] font-semibold text-[#0b6a5d]">{item.input.regimeTributario || "Diagnóstico"}</span>
        {insights.totalDebt > 0 ? <span className="rounded-full bg-[#f8eed6] px-2 py-0.5 text-[9px] font-semibold text-[#9b7226]">Negociação PGFN</span> : null}
      </div>
      <div className="mt-3 border-t border-[#eef1ef] pt-2">
        <p className="text-[9px] text-[#86938e]">Próxima ação</p>
        <p className="mt-0.5 text-[10px] font-semibold text-[#41554f]">{nextActionLabel(item.status)}</p>
      </div>
      <div className="mt-2">
        <p className="text-[9px] text-[#86938e]">Valor estimado</p>
        <p className="mt-0.5 text-[11px] font-bold text-[#17302e]">{formatCurrency(insights.totalDebt)}</p>
      </div>
    </Link>
  );
}

function ActivityOverview({ items, urgent }: { items: SavedDiagnostic[]; urgent: number }) {
  const meetings = items.filter((item) => item.status === "diagnostico_basico").length;
  const actions = items.filter((item) => item.status !== "perdido").length;
  const followUps = items.filter((item) => item.status === "proposta_enviada").length;
  return (
    <article className="rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-[#17302e]">Atividades e prioridades</h2>
      <div className="mt-4 flex gap-5 border-b border-[#e7ebe9] text-xs text-[#61736d]">
        <span className="border-b-2 border-[#0b5a51] pb-2 font-semibold text-[#0b5a51]">Visão geral</span>
        <span className="pb-2">Minhas atividades</span>
        <span className="pb-2">Por time</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat icon={CalendarClock} label="Reuniões hoje" value={String(meetings)} />
        <MiniStat icon={CheckSquare} label="Ações esta semana" value={String(actions)} />
        <MiniStat icon={Bell} label="Follow-ups pendentes" value={String(followUps + urgent)} />
      </div>
    </article>
  );
}

function TodayTasks({ items }: { items: SavedDiagnostic[] }) {
  const tasks = items.filter((item) => item.status !== "perdido").slice(0, 4);
  return (
    <article className="rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-[#17302e]">Tarefas de hoje</h2>
      <div className="mt-4 grid gap-3">
        {tasks.map((item) => (
          <Link key={item.id} to={`/app/leads/${item.id}`} className="flex items-start gap-3 border-b border-[#edf0ee] pb-3 last:border-0 last:pb-0">
            <span className="mt-0.5 h-4 w-4 rounded border border-[#8fa49a]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#2d4540]">{nextActionLabel(item.status)} — {item.input.nomeEmpresa}</p>
              <p className="mt-1 text-[10px] text-[#87938f]">{STATUS_LABELS[item.status]}</p>
            </div>
          </Link>
        ))}
        {tasks.length === 0 ? <p className="text-xs text-[#8a9893]">Nenhuma tarefa registrada.</p> : null}
      </div>
      <Link to="/app/pro" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#0b5a51]">Ver todas as tarefas <ArrowRight className="h-3.5 w-3.5" /></Link>
    </article>
  );
}

function OverdueActions({ items }: { items: SavedDiagnostic[] }) {
  return (
    <article className="rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm">
      <h2 className="font-serif text-lg font-semibold text-[#c14f3f]">Ações atrasadas</h2>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <Link key={item.id} to={`/app/leads/${item.id}`} className="flex items-start gap-3 border-b border-[#f1e8e6] pb-3 last:border-0 last:pb-0">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#e0614f]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#4d3936]">Priorizar — {item.input.nomeEmpresa}</p>
              <p className="mt-1 text-[10px] text-[#d06a5c]">Prioridade {calculateCrmInsights(item.crm!).priorityScore}</p>
            </div>
          </Link>
        ))}
        {items.length === 0 ? <p className="text-xs text-[#8a9893]">Nenhuma ação crítica no momento.</p> : null}
      </div>
      <Link to="/app/pro" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#c14f3f]">Ver todas atrasadas <ArrowRight className="h-3.5 w-3.5" /></Link>
    </article>
  );
}

function RecentCompanies({ items }: { items: SavedDiagnostic[] }) {
  return (
    <article className="rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg font-semibold text-[#17302e]">Empresas recentes</h2>
        <Link to="/app/pro" className="text-[10px] font-semibold text-[#0b5a51]">Ver todas</Link>
      </div>
      <div className="mt-4 grid gap-3">
        {items.map((item) => (
          <Link key={item.id} to={`/app/leads/${item.id}`} className="flex items-center gap-3 border-b border-[#edf0ee] pb-3 last:border-0 last:pb-0">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#edf3f0] text-[#0b5a51]"><Building2 className="h-4 w-4" /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[#2d4540]">{item.input.nomeEmpresa}</p>
              <p className="mt-0.5 truncate text-[9px] text-[#87938f]">{item.input.cnpj || "CNPJ não informado"}</p>
            </div>
            <span className="rounded-full bg-[#edf4f1] px-2 py-1 text-[8px] font-semibold text-[#0b5a51]">{STATUS_LABELS[item.status]}</span>
          </Link>
        ))}
        {items.length === 0 ? <p className="text-xs text-[#8a9893]">Nenhuma empresa cadastrada.</p> : null}
      </div>
    </article>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e3e8e5] p-3 text-center">
      <Icon className="mx-auto h-6 w-6 text-[#0b5a51]" />
      <p className="mt-3 text-[9px] leading-4 text-[#71817b]">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold text-[#17302e]">{value}</p>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = "green",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  accent?: "green" | "gold" | "red";
}) {
  const iconTone = accent === "gold" ? "bg-[#e9ad2e] text-white" : accent === "red" ? "bg-[#e95a43] text-white" : "bg-[#0b675d] text-white";
  return (
    <article className="rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${iconTone}`}><Icon className="h-5 w-5" /></div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#60716b]">{label}</p>
          <p className="mt-1 truncate font-serif text-2xl font-semibold text-[#17302e]">{value}</p>
        </div>
      </div>
      <p className="mt-3 text-[9px] text-[#82908b]">{detail}</p>
    </article>
  );
}

function ProSidebar() {
  const location = useLocation();
  const navItems = [
    { to: "/app/inicio", label: "Início", icon: LayoutDashboard },
    { to: "/app/pro", label: "Área Pro", icon: BriefcaseBusiness },
    { to: "/app/pro", label: "Empresas", icon: Building2 },
    { to: "/app/pro", label: "Pipeline", icon: Filter },
    { to: "/app/pro", label: "Tarefas", icon: CheckSquare },
    { to: "/app/pro", label: "Operações", icon: Target },
    { to: "/app/pro", label: "Financeiro", icon: WalletCards },
    { to: "/app/pro", label: "Relatórios", icon: BarChart3 },
  ];

  return (
    <aside className="border-b border-white/10 bg-[linear-gradient(180deg,#062f31,#053336)] px-4 py-5 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
      <Link to="/app/inicio" className="flex items-center gap-3 px-1">
        <span className="grid h-11 w-11 place-items-center text-[#e0ae48]"><ShieldCheck className="h-8 w-8" strokeWidth={1.6} /></span>
        <span className="font-serif text-lg font-semibold leading-5">RADAR<br /><span className="font-sans text-base font-medium">TRIBUTÁRIO</span></span>
      </Link>

      <nav className="mt-8 grid gap-2">
        {navItems.map((item, index) => {
          const active = item.label === "Área Pro" ? location.pathname.startsWith("/app/pro") : item.to === location.pathname;
          return (
            <Link key={`${item.label}-${index}`} to={item.to} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${active ? "bg-[#0b6a63] text-white shadow-inner" : "text-white/74 hover:bg-white/8 hover:text-white"}`}>
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.label === "Tarefas" ? <span className="ml-auto rounded-full border border-[#d7aa44]/60 px-2 py-0.5 text-[9px] text-[#e6bf6a]">12</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-white/10 pt-5">
        <Link to="/admin/usuarios" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-white/74 hover:bg-white/8 hover:text-white"><Settings className="h-4 w-4" /> Configurações</Link>
      </div>

      <div className="mt-10 hidden border-t border-white/10 pt-5 lg:block">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/8"><Users className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-semibold">Área autenticada</p>
            <p className="text-[10px] text-white/52">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function nextActionLabel(status: DiagnosticStatus) {
  const labels: Record<DiagnosticStatus, string> = {
    lead_parcial: "Qualificar lead",
    diagnostico_basico: "Entregar diagnóstico",
    aguardando_documentos: "Solicitar documentos",
    em_analise_especialista: "Definir estratégia",
    parecer_emitido: "Enviar proposta",
    proposta_enviada: "Realizar follow-up",
    perdido: "Registrar motivo",
  };
  return labels[status];
}
