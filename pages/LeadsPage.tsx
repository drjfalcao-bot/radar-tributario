import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Calculator,
  Columns3,
  FileText,
  Flame,
  LayoutDashboard,
  List,
  Search,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { formatCurrency } from "@/lib/RiskCalculator";
import { calculateCrmInsights } from "@/lib/crm";
import { listDiagnostics, type DiagnosticStatus, type SavedDiagnostic } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

const STATUS_LABELS: Record<DiagnosticStatus, string> = {
  lead_parcial: "Lead parcial",
  diagnostico_basico: "Diagnostico",
  aguardando_documentos: "Documentos",
  em_analise_especialista: "Analise tecnica",
  parecer_emitido: "Parecer",
  proposta_enviada: "Proposta",
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

export function LeadsPage() {
  const [items, setItems] = useState<SavedDiagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("lista");

  useEffect(() => {
    listDiagnostics()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const insights = items.map((item) => calculateCrmInsights(item.crm!));
    const pipelineValue = insights.reduce((sum, item) => sum + item.totalDebt + item.annualRevenue * 0.015, 0);
    const debtValue = insights.reduce((sum, item) => sum + item.totalDebt, 0);
    const urgent = insights.filter((item) => item.priorityScore >= 70).length;
    const proposals = items.filter((item) => item.status === "proposta_enviada").length;
    return { pipelineValue, debtValue, urgent, proposals };
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
    <ProShell
      title="Central de Leads Tributarios"
      subtitle="CRM interno para captar, qualificar e transformar diagnosticos em oportunidades fiscais."
    >
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric icon={BriefcaseBusiness} label="Leads no radar" value={String(items.length)} detail="Base consultiva ativa" />
        <Metric icon={BarChart3} label="Valor potencial" value={formatCurrency(stats.pipelineValue)} detail="Passivo + oportunidade" />
        <Metric icon={ShieldCheck} label="Passivo mapeado" value={formatCurrency(stats.debtValue)} detail="RFB, PGFN e correlatos" />
        <Metric icon={Calculator} label="Prioridade alta" value={String(stats.urgent)} detail={`${stats.proposals} proposta(s) enviada(s)`} />
      </section>

      <section className="mt-6 flex flex-col gap-3 border-y border-neutral-200 bg-white/70 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Esteira comercial</h2>
          <p className="text-sm text-neutral-500">Busque por empresa, CNPJ, contato ou etapa.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex rounded-md border border-neutral-300 bg-white p-1">
            <ViewButton icon={List} label="Lista" active={viewMode === "lista"} onClick={() => setViewMode("lista")} />
            <ViewButton icon={Columns3} label="Pipeline" active={viewMode === "pipeline"} onClick={() => setViewMode("pipeline")} />
            <ViewButton icon={Flame} label="Prioridade" active={viewMode === "prioridade"} onClick={() => setViewMode("prioridade")} />
          </div>
          <label className="flex min-h-11 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-500 md:w-80">
            <Search className="h-4 w-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full border-0 bg-transparent py-2 text-ink outline-none"
              placeholder="Buscar lead"
            />
          </label>
        </div>
      </section>

      {loading && <p className="mt-6 text-sm text-neutral-500">Carregando leads...</p>}
      {!loading && filtered.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-500">
          Nenhum lead encontrado. Use o radar publico para criar o primeiro diagnostico.
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <>
          {viewMode === "lista" && (
            <div className="mt-5 grid gap-3">
              {filtered.map((item) => (
                <LeadRow key={item.id} item={item} />
              ))}
            </div>
          )}
          {viewMode === "pipeline" && <PipelineView items={filtered} />}
          {viewMode === "prioridade" && <PriorityView items={filtered} />}
        </>
      )}
    </ProShell>
  );
}

function ViewButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof List;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-9 items-center gap-2 rounded px-3 text-sm font-semibold ${
        active ? "bg-petroleum-700 text-white" : "text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PipelineView({ items }: { items: SavedDiagnostic[] }) {
  return (
    <div className="mt-5 grid gap-3 xl:grid-cols-4 2xl:grid-cols-7">
      {STATUS_ORDER.map((status) => {
        const statusItems = items.filter((item) => item.status === status);
        return (
          <section key={status} className="rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{STATUS_LABELS[status]}</h3>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600">
                {statusItems.length}
              </span>
            </div>
            <div className="mt-3 grid gap-2">
              {statusItems.map((item) => (
                <LeadMiniCard key={item.id} item={item} />
              ))}
              {statusItems.length === 0 && <p className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-400">Sem leads</p>}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function PriorityView({ items }: { items: SavedDiagnostic[] }) {
  const sorted = [...items].sort(
    (a, b) => calculateCrmInsights(b.crm!).priorityScore - calculateCrmInsights(a.crm!).priorityScore,
  );

  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {sorted.map((item) => (
        <LeadPriorityCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function LeadMiniCard({ item }: { item: SavedDiagnostic }) {
  const insights = calculateCrmInsights(item.crm!);

  return (
    <Link to={`/app/leads/${item.id}`} className="block rounded-md border border-neutral-200 bg-[#f7faf8] p-3 hover:border-petroleum-500">
      <p className="line-clamp-1 text-sm font-semibold text-ink">{item.input.nomeEmpresa}</p>
      <p className="mt-1 text-xs text-neutral-500">{formatCurrency(insights.totalDebt)} em passivo</p>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-petroleum-700">P{insights.priorityScore}</span>
        <ArrowRight className="h-4 w-4 text-neutral-400" />
      </div>
    </Link>
  );
}

function LeadPriorityCard({ item }: { item: SavedDiagnostic }) {
  const insights = calculateCrmInsights(item.crm!);
  const tone =
    insights.priorityScore >= 75
      ? "border-red-200 bg-red-50"
      : insights.priorityScore >= 55
        ? "border-amber-200 bg-amber-50"
        : "border-neutral-200 bg-white";

  return (
    <Link to={`/app/leads/${item.id}`} className={`grid gap-4 rounded-lg border p-4 shadow-sm hover:border-petroleum-500 ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{item.input.nomeEmpresa}</h3>
          <p className="mt-1 text-sm text-neutral-600">{insights.headline}</p>
        </div>
        <div className="rounded-md bg-white px-3 py-2 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase text-neutral-500">Prioridade</p>
          <p className="text-2xl font-semibold text-ink">{insights.priorityScore}</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <DataBlock label="Receita" value={formatCurrency(insights.annualRevenue)} detail="ano" />
        <DataBlock label="Passivo" value={formatCurrency(insights.totalDebt)} detail="mapeado" />
        <DataBlock label="Etapa" value={STATUS_LABELS[item.status] ?? item.status} detail={item.crm?.temperature ?? "sem temperatura"} />
      </div>
    </Link>
  );
}

function LeadRow({ item }: { item: SavedDiagnostic }) {
  const insights = calculateCrmInsights(item.crm!);
  const statusLabel = STATUS_LABELS[item.status] ?? item.status;

  return (
    <Link
      to={`/app/leads/${item.id}`}
      className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-petroleum-500 hover:shadow-panel lg:grid-cols-[1.4fr_0.9fr_0.9fr_170px]"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-ink">{item.input.nomeEmpresa}</h3>
          <span className="rounded-full bg-petroleum-50 px-2.5 py-1 text-xs font-semibold text-petroleum-700">
            {statusLabel}
          </span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          {formatDate(item.createdAt)} · {item.input.regimeTributario} · {item.input.setor}
        </p>
        <p className="mt-3 max-w-2xl text-sm text-neutral-600">{insights.headline}</p>
      </div>

      <DataBlock label="Receita anual" value={formatCurrency(insights.annualRevenue)} detail={`${item.input.percentualB2B}% B2B informado`} />
      <DataBlock label="Debito total" value={formatCurrency(insights.totalDebt)} detail={insights.totalDebt > 0 ? "regularizacao possivel" : "nao confirmado"} />
      <div className="flex flex-col justify-between gap-3 rounded-md bg-[#f7faf8] p-3">
        <div>
          <p className="text-xs font-semibold uppercase text-neutral-500">Prioridade</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{insights.priorityScore}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full bg-petroleum-700" style={{ width: `${insights.priorityScore}%` }} />
        </div>
      </div>
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-600">{label}</p>
        <Icon className="h-4 w-4 text-petroleum-700" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

function DataBlock({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-md border border-neutral-100 bg-white p-3">
      <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
    </div>
  );
}

export function ProShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const location = useLocation();
  const navItems = [
    { to: "/app/leads", label: "CRM", icon: LayoutDashboard },
    { to: "/", label: "Radar publico", icon: Calculator },
    { to: "/admin/usuarios", label: "Usuarios", icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7f5]">
      <div className="mx-auto grid max-w-[1500px] gap-0 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-neutral-200 bg-[#102524] px-4 py-5 text-white lg:min-h-screen lg:border-b-0 lg:border-r">
          <Link to="/app/leads" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-petroleum-900">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Radar Tributario</span>
              <span className="block text-xs text-white/60">Inteligencia fiscal</span>
            </span>
          </Link>

          <nav className="mt-7 flex gap-2 overflow-x-auto lg:flex-col">
            {navItems.map((item) => {
              const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    active ? "bg-white text-petroleum-900" : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 hidden rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/70 lg:block">
            <FileText className="mb-3 h-5 w-5 text-white" />
            Operacao interna para transformar calculadoras publicas em leads qualificados.
          </div>
        </aside>

        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase text-petroleum-700">Area Pro</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-3xl text-sm text-neutral-600">{subtitle}</p> : null}
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
