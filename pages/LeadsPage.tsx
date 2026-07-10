import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Calculator,
  ChevronDown,
  ExternalLink,
  FileSearch,
  Landmark,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCircle,
  X,
} from "lucide-react";
import { NegotiationCalculator } from "@/components/NegotiationCalculator";
import { formatCurrency } from "@/lib/RiskCalculator";
import { calculateCrmInsights } from "@/lib/crm";
import { getCurrentAuthorizedUser, listDiagnostics, type AuthorizedUser, type SavedDiagnostic } from "@/lib/storage";

type PublicUpdate = {
  id: string;
  orgao: string;
  titulo: string;
  resumo: string;
  data?: string;
  tipo: string;
  urlOficial: string;
  destaque?: boolean;
};

const PUBLIC_UPDATES: PublicUpdate[] = [
  {
    id: "receita-federal",
    orgao: "RECEITA FEDERAL",
    titulo: "Orientações oficiais",
    resumo: "Acompanhe orientações e publicações oficiais sobre a Reforma Tributária.",
    tipo: "Fonte oficial",
    urlOficial: "https://www.gov.br/receitafederal/pt-br",
    destaque: true,
  },
  {
    id: "pgfn",
    orgao: "PGFN",
    titulo: "Negociação tributária",
    resumo: "Consulte editais, modalidades de negociação e condições oficiais de adesão.",
    tipo: "Fonte oficial",
    urlOficial: "https://www.gov.br/pgfn/pt-br",
  },
  {
    id: "fazenda",
    orgao: "MINISTÉRIO DA FAZENDA",
    titulo: "Atos e comunicados",
    resumo: "Acompanhe atos, comunicados e informações com impacto econômico e tributário.",
    tipo: "Fonte oficial",
    urlOficial: "https://www.gov.br/fazenda/pt-br",
  },
  {
    id: "ibs-cbs",
    orgao: "IBS / CBS",
    titulo: "Novo sistema tributário",
    resumo: "Acompanhe normas, cronogramas e orientações oficiais do novo sistema tributário.",
    tipo: "Fonte oficial",
    urlOficial: "https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria",
  },
];

export function LeadsPage() {
  const [items, setItems] = useState<SavedDiagnostic[]>([]);
  const [user, setUser] = useState<AuthorizedUser | null>(null);
  const [query, setQuery] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);
  const [showReformPreparation, setShowReformPreparation] = useState(false);

  useEffect(() => {
    listDiagnostics().then(setItems).catch(() => setItems([]));
    getCurrentAuthorizedUser().then(setUser).catch(() => setUser(null));
  }, []);

  const passivoSummary = useMemo(() => {
    const insights = items.map((item) => calculateCrmInsights(item.crm!));
    const debt = insights.reduce((sum, item) => sum + item.totalDebt, 0);
    const scenarios = items.reduce((sum, item) => sum + (item.crm?.simulations?.filter((scenario) => scenario.enabled).length ?? 0), 0);
    const savings = items.reduce((sum, item) => {
      const estimated = item.crm?.proposal?.estimatedSavings ?? 0;
      return sum + Math.max(0, estimated);
    }, 0);
    return { debt, scenarios, savings };
  }, [items]);

  const hasPassivoData = passivoSummary.debt > 0 || passivoSummary.scenarios > 0 || passivoSummary.savings > 0;
  const displayName = user?.nome || user?.email || "Usuário";
  const displayRole = user?.role ? roleLabel(user.role) : "Sessão ativa";

  return (
    <main className="min-h-screen bg-[#eef3ef] text-[#102524]">
      <div className="grid min-h-screen lg:grid-cols-[76px_1fr]">
        <aside className="border-b border-white/10 bg-[#092321] text-white lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 py-4 lg:flex-col lg:gap-6 lg:px-0 lg:py-6">
            <Link to="/app/leads" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0a2b28] shadow-lg shadow-black/10">
              <ShieldCheck className="h-5 w-5" />
            </Link>
            <nav className="flex items-center gap-2 lg:flex-col">
              <SideLink to="/app/leads" label="Início" icon={LayoutDashboard} />
              <SideLink to="/" label="Módulos" icon={Calculator} />
              <SideLink to="/admin/usuarios" label="Configurações" icon={Settings} />
            </nav>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="bg-[#092321] px-4 py-5 text-white shadow-xl shadow-[#0a2b28]/15 sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1500px] flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10">
                  <ShieldCheck className="h-7 w-7 text-[#d0ad63]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Central Estratégica</h1>
                  <p className="mt-1 text-sm text-white/68">Pesquise uma empresa ou inicie uma nova análise</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:min-w-[680px] xl:flex-row xl:items-center">
                <label className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white px-4 text-sm text-[#5d6d68] shadow-lg shadow-black/10">
                  <Search className="h-4 w-4 text-[#0b5a51]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full border-0 bg-transparent text-[#102524] outline-none"
                    placeholder="Buscar empresa, CNPJ ou diagnóstico"
                  />
                </label>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/8 px-3 py-2">
                  <button type="button" className="grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white">
                    <Bell className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0a2b28]">
                      <UserCircle className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="max-w-44 truncate text-sm font-semibold">{displayName}</p>
                      <p className="text-xs text-white/58">{displayRole}</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <section className="grid gap-5 xl:grid-cols-2">
              <StrategicSimulatorCard
                tone="passivo"
                icon={Landmark}
                title="Simulador de Passivo"
                description="Negocie dívidas e descubra o melhor cenário para reduzir seu passivo tributário."
                statusTitle={hasPassivoData ? "Simulação mapeada" : "Nova simulação"}
                statusText={hasPassivoData ? "Dados reais consolidados dos diagnósticos registrados" : "Informe os dados para comparar cenários"}
                lines={[
                  ["Dívida", hasPassivoData ? formatCurrency(passivoSummary.debt) : "—"],
                  ["CAPAG", "—"],
                  ["RFB / PGFN", hasPassivoData ? "Dados mapeados" : "—"],
                  ["Cenários", hasPassivoData ? String(passivoSummary.scenarios) : "—"],
                  ["Potencial de economia", hasPassivoData && passivoSummary.savings > 0 ? formatCurrency(passivoSummary.savings) : "—"],
                ]}
                buttonLabel="SIMULAR PASSIVO"
                onAction={() => setShowCalculator(true)}
              />

              <StrategicSimulatorCard
                tone="reforma"
                icon={TrendingUp}
                title="Simulador da Reforma"
                description="Projete os impactos da Reforma Tributária no seu negócio e antecipe decisões."
                statusTitle="Módulo em preparação"
                statusText="Informe as premissas para projetar impactos"
                lines={[
                  ["Carga atual", "—"],
                  ["Carga projetada", "—"],
                  ["Créditos", "—"],
                  ["Margem", "—"],
                  ["Impacto anual", "—"],
                ]}
                buttonLabel="SIMULAR REFORMA"
                onAction={() => setShowReformPreparation(true)}
              />
            </section>

            <section className="flex flex-col gap-4 rounded-3xl border border-[#d9e2dd] bg-white px-5 py-5 shadow-lg shadow-[#102524]/5 md:flex-row md:items-center md:justify-between md:px-7">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#e7f0ec] text-[#0b5a51]">
                  <Target className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#102524]">Novo Diagnóstico Estratégico</h2>
                  <p className="mt-1 text-sm text-[#61736d]">
                    Combina empresa + passivo + reforma + riscos + oportunidades + estratégia
                  </p>
                </div>
              </div>
              <Link
                to="/app/diagnostico/novo"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0b4f49] px-5 text-sm font-semibold text-white shadow-lg shadow-[#0b4f49]/20 transition hover:bg-[#0a423d]"
              >
                INICIAR DIAGNÓSTICO COMPLETO
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className="grid gap-5 rounded-[28px] bg-[#f7faf8] p-5 md:p-6 xl:grid-cols-[0.8fr_1.6fr]">
              <div className="flex flex-col justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b49355]">Fontes oficiais</p>
                  <h2 className="mt-3 text-2xl font-semibold text-[#102524]">Fique ligado nas decisões</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-[#61736d]">
                    Atualizações estratégicas publicadas por órgãos públicos para acompanhar impactos e oportunidades.
                  </p>
                </div>
                <div className="hidden h-24 rounded-3xl border border-[#dfe8e3] bg-white/70 xl:block" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {PUBLIC_UPDATES.map((item) => (
                  <PublicUpdateCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      {showCalculator ? (
        <Modal title="Simulador de Passivo" onClose={() => setShowCalculator(false)}>
          <NegotiationCalculator />
        </Modal>
      ) : null}

      {showReformPreparation ? (
        <Modal title="Simulador da Reforma" onClose={() => setShowReformPreparation(false)}>
          <div className="rounded-2xl border border-dashed border-[#d1ddd7] bg-[#f7faf8] p-8 text-center">
            <LineChart className="mx-auto h-10 w-10 text-[#0b5a51]" />
            <h3 className="mt-4 text-xl font-semibold text-[#102524]">Módulo em preparação</h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#61736d]">
              A navegação está preparada. O motor e a tela definitiva do simulador da reforma serão implementados em tarefa própria.
            </p>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}

function StrategicSimulatorCard({
  tone,
  icon: Icon,
  title,
  description,
  statusTitle,
  statusText,
  lines,
  buttonLabel,
  onAction,
}: {
  tone: "passivo" | "reforma";
  icon: typeof Landmark;
  title: string;
  description: string;
  statusTitle: string;
  statusText: string;
  lines: [string, string][];
  buttonLabel: string;
  onAction: () => void;
}) {
  const isPassivo = tone === "passivo";
  return (
    <article
      className={`relative flex min-h-[430px] overflow-hidden rounded-[30px] p-6 text-white shadow-2xl shadow-[#102524]/15 md:p-8 ${
        isPassivo
          ? "bg-[linear-gradient(135deg,#082a27_0%,#0c4f47_58%,#08332f_100%)]"
          : "bg-[linear-gradient(135deg,#082637_0%,#0b4b63_58%,#062b3b_100%)]"
      }`}
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_18px_18px,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border border-[#d0ad63]/35" />
      <div className="absolute bottom-7 right-7 h-24 w-24 rounded-full border border-white/10" />
      <div className="relative z-10 flex w-full flex-col justify-between gap-8">
        <div>
          <div className="flex items-start justify-between gap-5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/10">
              <Icon className="h-7 w-7 text-[#d0ad63]" />
            </div>
            <span className="rounded-full border border-[#d0ad63]/35 bg-[#d0ad63]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f1d99a]">
              Estratégia
            </span>
          </div>
          <h2 className="mt-7 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">{description}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/12 p-5 backdrop-blur">
          <div className="mb-5">
            <p className="text-2xl font-semibold">{statusTitle}</p>
            <p className="mt-1 text-sm text-white/62">{statusText}</p>
          </div>
          <dl className="grid gap-3">
            {lines.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0">
                <dt className="text-sm text-white/65">{label}</dt>
                <dd className={`text-right text-base font-semibold ${value === "—" ? "text-white/42" : "text-[#baf2d7]"}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#d0ad63] px-5 text-sm font-bold tracking-[0.08em] text-[#102524] shadow-xl shadow-black/20 transition hover:bg-[#dfc178]"
        >
          {buttonLabel}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function PublicUpdateCard({ item }: { item: PublicUpdate }) {
  return (
    <article className="flex min-h-[250px] flex-col rounded-3xl border border-[#e0e7e3] bg-white p-5 shadow-lg shadow-[#102524]/5">
      <div className="flex items-center justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e7f0ec] text-[#0b5a51]">
          <FileSearch className="h-5 w-5" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b49355]">{item.data ?? item.tipo}</span>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#0b5a51]">{item.orgao}</p>
      <h3 className="mt-2 text-lg font-semibold text-[#102524]">{item.titulo}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#61736d]">{item.resumo}</p>
      <a
        href={item.urlOficial}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0b5a51] hover:underline"
      >
        Ver atualização
        <ExternalLink className="h-4 w-4" />
      </a>
    </article>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid bg-[#071b19]/70 p-3 backdrop-blur-sm md:p-6">
      <section className="mx-auto flex max-h-[calc(100vh-24px)] w-full max-w-[1400px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:max-h-[calc(100vh-48px)]">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-4 md:px-6">
          <h2 className="text-lg font-semibold text-[#102524]">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-[#102524]">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-4 md:p-6">{children}</div>
      </section>
    </div>
  );
}

function SideLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof LayoutDashboard }) {
  const location = useLocation();
  const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
  return (
    <Link
      to={to}
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 place-items-center rounded-xl transition ${
        active ? "bg-white text-[#0a2b28]" : "text-white/62 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
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
    { to: "/app/leads", label: "Central", icon: LayoutDashboard },
    { to: "/", label: "Radar público", icon: Calculator },
    { to: "/admin/usuarios", label: "Usuários", icon: Settings },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7f5]">
      <div className="mx-auto grid max-w-[1500px] gap-0 lg:grid-cols-[76px_1fr]">
        <aside className="border-b border-neutral-200 bg-[#102524] px-4 py-4 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:px-0">
          <div className="flex items-center justify-between lg:flex-col lg:gap-6">
            <Link to="/app/leads" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-petroleum-900">
              <ShieldCheck className="h-5 w-5" />
            </Link>
            <nav className="flex gap-2 lg:flex-col">
              {navItems.map((item) => {
                const active = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-label={item.label}
                    title={item.label}
                    className={`grid h-11 w-11 place-items-center rounded-xl transition ${
                      active ? "bg-white text-petroleum-900" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6">
            <p className="text-xs font-semibold uppercase text-petroleum-700">Central Estratégica</p>
            <h1 className="mt-1 text-2xl font-semibold text-ink md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 max-w-3xl text-sm text-neutral-600">{subtitle}</p> : null}
          </header>
          {children}
        </section>
      </div>
    </main>
  );
}
