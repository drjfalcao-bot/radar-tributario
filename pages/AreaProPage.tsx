import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarClock,
  Columns3,
  FileText,
  Flame,
  LayoutDashboard,
  List,
  Search,
  Settings,
  ShieldCheck,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/RiskCalculator";
import { calculateCrmInsights } from "@/lib/crm";
import { listDiagnostics, type DiagnosticStatus, type SavedDiagnostic } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<DiagnosticStatus, string> = {
  lead_parcial: "Novo lead",
  diagnostico_basico: "Diagnóstico",
  aguardando_documentos: "Aguardando documentos",
  em_analise_especialista: "Estratégia em análise",
  parecer_emitido: "Parecer emitido",
  proposta_enviada: "Proposta enviada",
  perdido: "Perdido",
};

const STATUS_ORDER: DiagnosticStatus[] = [
  "lead_parcial",
  "diagnostico_basico",
  "aguardando_documentos",
  "em_analise_especialista",
  "parecer_emitido",
  "proposta_enviada",
  "perdido",
];

type ViewMode = "lista" | "pipeline" | "prioridade";

export function AreaProPage() {
  const [items, setItems] = useState<SavedDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("pipeline");

  useEffect(() => {
    listDiagnostics()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const insights = items.map((item) => calculateCrmInsights(item.crm!));
    const pipelineValue = insights.reduce((sum, item) => sum + item.totalDebt + item.annualRevenue * 0.015, 0);
    const debtValue = insights.reduce((sum, item) => sum + item.totalDebt, 0);
    const urgent = insights.filter((item) => item.priorityScore >= 70).length;
    const proposals = items.filter((item) => item.status === "proposta_enviada").length;
    const companies = new Set(items.map((item) => item.input.cnpj || item.input.nomeEmpresa)).size;
    return { pipelineValue, debtValue, urgent, proposals, companies };
  }, [items]);

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

  return (
    <ProShell>
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#102524] md:text-4xl">Área Pro</h1>
            <span className="rounded-full border border-[#c6d8cf] bg-[#e8f1ed] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#0b5a51]">CRM interno</span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#61736d]">
            Gestão comercial, estratégica e operacional das empresas, oportunidades, diagnósticos e propostas.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/app/diagnostico/novo" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#bfd1c8] bg-white px-4 text-sm font-semibold text-[#0b5a51] shadow-sm transition hover:bg-[#f4f8f6]">
            <Target className="h-4 w-4" />
            Novo diagnóstico
          </Link>
          <button type="button" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b4f49] px-4 text-sm font-semibold text-white shadow-lg shadow-[#0b4f49]/20">
            <BriefcaseBusiness className="h-4 w-4" />
            Nova oportunidade
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Building2} label="Empresas ativas" value={String(stats.companies)} detail="Base empresarial mapeada" />
        <Metric icon={BriefcaseBusiness} label="Oportunidades abertas" value={String(items.filter((item) => item.status !== "perdido").length)} detail="Esteira comercial ativa" />
        <Metric icon={BarChart3} label="Valor em negociação" value={formatCurrency(stats.pipelineValue)} detail="Passivo + oportunidade" />
        <Metric icon={FileText} label="Propostas abertas" value={String(stats.proposals)} detail="Aguardando decisão" />
        <Metric icon={Flame} label="Prioridades altas" value={String(stats.urgent)} detail="Exigem próxima ação" alert={stats.urgent > 0} />
      </section>

      <section className="mt-6 rounded-3xl border border-[#dce5e0] bg-white p-4 shadow-lg shadow-[#102524]/5 md:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#102524]">Pipeline de oportunidades</h2>
            <p className="mt-1 text-sm text-[#61736d]">Visualize empresas, etapa comercial, prioridade e próxima decisão.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex rounded-xl border border-[#d7e2dd] bg-[#f7faf8] p-1">
              <ViewButton icon={List} label="Lista" active={viewMode === "lista"} onClick={() => setViewMode("lista")} />
              <ViewButton icon={Columns3} label="Pipeline" active={viewMode === "pipeline"} onClick={() => setViewMode("pipeline")} />
              <ViewButton icon={Flame} label="Prioridade" active={viewMode === "prioridade"} onClick={() => setViewMode("prioridade")} />
            </div>
            <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#d7e2dd] bg-white px-3 text-sm text-[#61736d] md:w-[360px]">
              <Search className="h-4 w-4" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full border-0 bg-transparent py-2 text-[#102524] outline-none" placeholder="Buscar empresa, CNPJ, contato ou etapa" />
            </label>
          </div>
        </div>

        {loading ? <p className="mt-6 text-sm text-[#61736d]">Carregando dados do CRM...</p> : null}

        {!loading && filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#cddbd4] bg-[#f8faf9] p-8 text-center">
            <Users className="mx-auto h-9 w-9 text-[#7a9288]" />
            <h3 className="mt-3 text-lg font-semibold text-[#102524]">Nenhuma empresa encontrada</h3>
            <p className="mt-1 text-sm text-[#61736d]">Inicie um diagnóstico para criar o primeiro dossiê empresarial.</p>
          </div>
        ) : null}

        {!loading && filtered.length > 0 ? (
          <>
            {viewMode === "lista" ? <ListView items={filtered} /> : null}
            {viewMode === "pipeline" ? <PipelineView items={filtered} /> : null}
            {viewMode === "prioridade" ? <PriorityView items={filtered} /> : null}
          </>
        ) : null}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-3xl border border-[#dce5e0] bg-white p-5 shadow-lg shadow-[#102524]/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#102524]">Atividades e prioridades</h2>
              <p className="mt-1 text-sm text-[#61736d]">Próximas ações que precisam movimentar a esteira.</p>
            </div>
            <CalendarClock className="h-5 w-5 text-[#0b5a51]" />
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <ActivityCard label="Follow-ups pendentes" value={String(items.filter((item) => item.status === "proposta_enviada").length)} detail="Propostas aguardando retorno" />
            <ActivityCard label="Diagnósticos em curso" value={String(items.filter((item) => item.status === "diagnostico_basico" || item.status === "em_analise_especialista").length)} detail="Análises a concluir" />
            <ActivityCard label="Casos prioritários" value={String(stats.urgent)} detail="Pontuação igual ou superior a 70" />
          </div>
        </article>

        <article className="rounded-3xl border border-[#dce5e0] bg-[#102524] p-5 text-white shadow-xl shadow-[#102524]/12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d0ad63]">Estrutura V3</p>
          <h2 className="mt-3 text-xl font-semibold">Empresa como centro do CRM</h2>
          <p className="mt-2 text-sm leading-6 text-white/68">O próximo avanço será transformar cada registro em um Dossiê Empresarial 360 com contatos, passivo, Reforma, documentos, propostas, operação e financeiro.</p>
          <Link to="/app/inicio" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#d0ad63]">Voltar à Central Estratégica <ArrowRight className="h-4 w-4" /></Link>
        </article>
      </section>
    </ProShell>
  );
}

function ListView({ items }: { items: SavedDiagnostic[] }) {
  return (
    <div className="mt-5 grid gap-3">
      {items.map((item) => {
        const insights = calculateCrmInsights(item.crm!);
        return (
          <Link key={item.id} to={`/app/leads/${item.id}`} className="grid gap-4 rounded-2xl border border-[#dce5e0] bg-white p-4 transition hover:border-[#8fb5a4] hover:shadow-md lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.5fr]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#102524]">{item.input.nomeEmpresa}</h3>
                <span className="rounded-full bg-[#e8f1ed] px-2.5 py-1 text-xs font-semibold text-[#0b5a51]">{STATUS_LABELS[item.status]}</span>
              </div>
              <p className="mt-1 text-xs text-[#70817b]">{item.input.cnpj || "CNPJ não informado"} · {formatDate(item.createdAt)}</p>
              <p className="mt-3 text-sm text-[#61736d]">{insights.headline}</p>
            </div>
            <DataBlock label="Passivo" value={formatCurrency(insights.totalDebt)} detail="Mapeado" />
            <DataBlock label="Receita anual" value={formatCurrency(insights.annualRevenue)} detail={`${item.input.percentualB2B}% B2B`} />
            <DataBlock label="Prioridade" value={String(insights.priorityScore)} detail={item.crm?.temperature ?? "Sem temperatura"} />
          </Link>
        );
      })}
    </div>
  );
}

function PipelineView({ items }: { items: SavedDiagnostic[] }) {
  return (
    <div className="mt-5 overflow-x-auto pb-2">
      <div className="grid min-w-[1500px] grid-cols-7 gap-3">
        {STATUS_ORDER.map((status) => {
          const statusItems = items.filter((item) => item.status === status);
          return (
            <section key={status} className="rounded-2xl border border-[#dce5e0] bg-[#f7faf8] p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#102524]">{STATUS_LABELS[status]}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[#61736d]">{statusItems.length}</span>
              </div>
              <div className="mt-3 grid gap-2">
                {statusItems.map((item) => <PipelineCard key={item.id} item={item} />)}
                {statusItems.length === 0 ? <p className="rounded-xl border border-dashed border-[#d5e0db] bg-white/60 p-3 text-xs text-[#8a9994]">Sem oportunidades</p> : null}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function PipelineCard({ item }: { item: SavedDiagnostic }) {
  const insights = calculateCrmInsights(item.crm!);
  return (
    <Link to={`/app/leads/${item.id}`} className="block rounded-xl border border-[#dce5e0] bg-white p-3 shadow-sm transition hover:border-[#8fb5a4]">
      <p className="line-clamp-2 text-sm font-semibold text-[#102524]">{item.input.nomeEmpresa}</p>
      <p className="mt-1 text-xs text-[#7a8984]">{item.input.cnpj || "Sem CNPJ"}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-[#e8f1ed] px-2 py-1 text-[10px] font-semibold text-[#0b5a51]">{item.input.regimeTributario}</span>
        <span className="rounded-full bg-[#f5efe1] px-2 py-1 text-[10px] font-semibold text-[#9a7635]">P{insights.priorityScore}</span>
      </div>
      <p className="mt-3 text-xs text-[#61736d]">Valor mapeado</p>
      <p className="mt-1 text-sm font-semibold text-[#102524]">{formatCurrency(insights.totalDebt)}</p>
      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[#0b5a51]">
        Abrir empresa
        <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}

function PriorityView({ items }: { items: SavedDiagnostic[] }) {
  const sorted = [...items].sort((a, b) => calculateCrmInsights(b.crm!).priorityScore - calculateCrmInsights(a.crm!).priorityScore);
  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {sorted.map((item) => {
        const insights = calculateCrmInsights(item.crm!);
        const high = insights.priorityScore >= 70;
        return (
          <Link key={item.id} to={`/app/leads/${item.id}`} className={`rounded-2xl border p-4 transition hover:shadow-md ${high ? "border-red-200 bg-red-50" : "border-[#dce5e0] bg-white"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[#102524]">{item.input.nomeEmpresa}</h3>
                <p className="mt-1 text-sm text-[#61736d]">{insights.headline}</p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2 text-center shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#70817b]">Prioridade</p>
                <p className="text-2xl font-semibold text-[#102524]">{insights.priorityScore}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <DataBlock label="Passivo" value={formatCurrency(insights.totalDebt)} detail="Mapeado" />
              <DataBlock label="Etapa" value={STATUS_LABELS[item.status]} detail="Comercial" />
              <DataBlock label="Próxima ação" value={high ? "Priorizar" : "Acompanhar"} detail="Fluxo interno" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ViewButton({ icon: Icon, label, active, onClick }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${active ? "bg-[#0b4f49] text-white" : "text-[#61736d] hover:bg-white"}`}>
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Metric({ icon: Icon, label, value, detail, alert = false }: { icon: LucideIcon; label: string; value: string; detail: string; alert?: boolean }) {
  return (
    <article className="rounded-2xl border border-[#dce5e0] bg-white p-4 shadow-lg shadow-[#102524]/4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#61736d]">{label}</p>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${alert ? "bg-red-50 text-red-600" : "bg-[#e8f1ed] text-[#0b5a51]"}`}><Icon className="h-5 w-5" /></div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[#102524]">{value}</p>
      <p className="mt-1 text-xs text-[#81908b]">{detail}</p>
    </article>
  );
}

function DataBlock({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-[#e2e9e5] bg-[#f8faf9] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a8984]">{label}</p>
      <p className="mt-1 text-base font-semibold text-[#102524]">{value}</p>
      <p className="mt-1 text-xs text-[#81908b]">{detail}</p>
    </div>
  );
}

function ActivityCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-[#f5f8f6] p-4">
      <p className="text-sm font-semibold text-[#61736d]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#102524]">{value}</p>
      <p className="mt-1 text-xs text-[#81908b]">{detail}</p>
    </div>
  );
}

function ProShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navItems = [
    { to: "/app/inicio", label: "Início", icon: LayoutDashboard },
    { to: "/app/pro", label: "Área Pro", icon: BriefcaseBusiness },
    { to: "/app/diagnostico/novo", label: "Diagnóstico", icon: Calculator },
    { to: "/admin/usuarios", label: "Configurações", icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-[#eef3ef] text-[#102524]">
      <div className="grid min-h-screen lg:grid-cols-[250px_1fr]">
        <aside className="border-b border-white/10 bg-[#092321] px-4 py-5 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
          <Link to="/app/inicio" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0a2b28]"><ShieldCheck className="h-5 w-5" /></span>
            <span><strong className="block text-sm">Radar Tributário</strong><span className="text-xs text-white/55">Inteligência empresarial</span></span>
          </Link>

          <nav className="mt-8 flex gap-2 overflow-x-auto lg:flex-col">
            {navItems.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
              return (
                <Link key={item.to} to={item.to} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${active ? "bg-white text-[#0a2b28]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65 lg:block">
            <FileText className="mb-3 h-5 w-5 text-[#d0ad63]" />
            A empresa será o centro permanente dos contatos, oportunidades, diagnósticos, simulações, propostas e operações.
          </div>
        </aside>

        <section className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </section>
      </div>
    </main>
  );
}
