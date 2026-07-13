import { useEffect, useMemo, useState, type LucideIcon, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  Calculator,
  FileSearch,
  Landmark,
  LayoutDashboard,
  Network,
  Scale,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCircle,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import {
  getCurrentAuthorizedUser,
  listDiagnostics,
  type AuthorizedUser,
  type SavedDiagnostic,
} from "@/lib/storage";

type OfficialSource = {
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  subject: string;
};

const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    name: "Receita Federal",
    subject: "Normas e orientações",
    description: "Acompanhe atos, obrigações e orientações com impacto direto na rotina tributária.",
    href: "https://www.gov.br/receitafederal/pt-br",
    icon: Building2,
  },
  {
    name: "PGFN",
    subject: "Transações e regularização",
    description: "Consulte editais, modalidades de negociação e comunicados oficiais da dívida ativa.",
    href: "https://www.gov.br/pgfn/pt-br",
    icon: Scale,
  },
  {
    name: "Ministério da Fazenda",
    subject: "Política tributária",
    description: "Acompanhe medidas, regulamentações e decisões que alteram o ambiente empresarial.",
    href: "https://www.gov.br/fazenda/pt-br",
    icon: Landmark,
  },
  {
    name: "Reforma Tributária",
    subject: "IBS, CBS e transição",
    description: "Centralize a leitura das mudanças do novo sistema de tributação sobre o consumo.",
    href: "https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria",
    icon: Network,
  },
];

export function CentralStrategicPage() {
  const [user, setUser] = useState<AuthorizedUser | null>(null);
  const [diagnostics, setDiagnostics] = useState<SavedDiagnostic[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getCurrentAuthorizedUser().then(setUser).catch(() => setUser(null));
    listDiagnostics().then(setDiagnostics).catch(() => setDiagnostics([]));
  }, []);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    return diagnostics
      .filter((item) =>
        [item.input.nomeEmpresa, item.input.cnpj, item.input.contato]
          .join(" ")
          .toLowerCase()
          .includes(term),
      )
      .slice(0, 5);
  }, [diagnostics, query]);

  const displayName = user?.nome || user?.email || "Usuário";
  const displayRole = formatRole(user?.role);

  return (
    <main className="min-h-screen bg-[#f3f5f3] text-[#142725]">
      <div className="grid min-h-screen lg:grid-cols-[72px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#052d2e] text-white lg:border-b-0 lg:border-r">
          <div className="flex min-h-[72px] items-center justify-between px-3 py-3 lg:min-h-screen lg:flex-col lg:py-5">
            <div className="flex items-center gap-3 lg:flex-col lg:gap-6">
              <Link to="/app/inicio" aria-label="Radar Tributário" className="grid h-11 w-11 place-items-center">
                <BrandMark size="md" />
              </Link>

              <nav className="flex items-center gap-2 lg:flex-col">
                <SideLink to="/app/inicio" icon={LayoutDashboard} label="Início" />
                <SideLink to="/app/pro" icon={BriefcaseBusiness} label="Área Pro" />
                <SideLink to="/app/simulador-passivo" icon={Calculator} label="Simulador de Passivo" />
                <SideLink to="/app/diagnostico/novo" icon={Target} label="Diagnóstico" />
              </nav>
            </div>

            <SideLink to="/admin/usuarios" icon={Settings} label="Configurações" />
          </div>
        </aside>

        <section className="min-w-0">
          <header className="relative overflow-visible border-b border-white/10 bg-[radial-gradient(circle_at_62%_140%,rgba(22,111,99,.30),transparent_42%),linear-gradient(100deg,#052829_0%,#073638_55%,#052d31_100%)] px-4 py-5 text-white sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-[1680px] flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d9b56b]">
                  <span className="h-px w-8 bg-[#d9b56b]/70" />
                  Inteligência empresarial
                </div>
                <h1 className="font-serif text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
                  Central Estratégica
                </h1>
                <p className="mt-2 text-sm text-white/66">
                  Pesquise uma empresa ou inicie uma nova análise.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 xl:max-w-[760px] xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                  <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/14 bg-white/[0.07] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur">
                    <Search className="h-5 w-5 shrink-0 text-white/55" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Buscar empresa, CNPJ ou diagnóstico"
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/42"
                    />
                  </label>

                  {query.trim() ? (
                    <div className="absolute left-0 right-0 top-[56px] z-50 overflow-hidden rounded-xl border border-[#dce4e0] bg-white text-[#17302e] shadow-2xl">
                      {matches.length ? (
                        matches.map((item) => (
                          <Link
                            key={item.id}
                            to={`/app/empresas/${item.id}`}
                            className="flex items-center justify-between border-b border-[#edf1ef] px-4 py-3 transition last:border-0 hover:bg-[#f3f7f5]"
                          >
                            <span className="min-w-0">
                              <strong className="block truncate text-sm">{item.input.nomeEmpresa}</strong>
                              <small className="text-[#71817b]">{item.input.cnpj || "CNPJ não informado"}</small>
                            </span>
                            <ArrowRight className="h-4 w-4 shrink-0 text-[#0b6a60]" />
                          </Link>
                        ))
                      ) : (
                        <p className="p-4 text-sm text-[#71817b]">Nenhuma empresa encontrada.</p>
                      )}
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-label="Notificações"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.06] text-white/72 transition hover:bg-white/10 hover:text-white"
                >
                  <Bell className="h-5 w-5" />
                </button>

                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d8aa51]/35 bg-[#d8aa51]/10 text-[#ead8a8]">
                    <UserCircle className="h-6 w-6" />
                  </span>
                  <span className="min-w-0 pr-2">
                    <strong className="block max-w-44 truncate text-sm font-semibold">{displayName}</strong>
                    <small className="block truncate text-[11px] text-white/48">{displayRole}</small>
                  </span>
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1680px] px-3 py-4 sm:px-5 lg:px-7 lg:py-6">
            <section className="grid gap-4 xl:grid-cols-2">
              <StrategicModule
                tone="passivo"
                icon={Scale}
                eyebrow="Negociação e regularização"
                title="Simulador de Passivo"
                description="Negocie dívidas e descubra o melhor cenário para reduzir o impacto do passivo tributário no caixa da empresa."
                actionLabel="Simular passivo"
                actionTo="/app/simulador-passivo"
                status="Nenhuma simulação recente"
                support="Informe os dados para comparar cenários de regularização."
              >
                <MetricRow label="Dívida consolidada" value="—" />
                <MetricRow label="CAPAG" value="—" />
                <MetricRow label="RFB / PGFN" value="—" />
                <MetricRow label="Cenários disponíveis" value="—" />
                <MetricRow label="Potencial de economia" value="—" emphasis />
              </StrategicModule>

              <StrategicModule
                tone="reforma"
                icon={TrendingUp}
                eyebrow="Impacto e preparação"
                title="Simulador da Reforma"
                description="Projete os efeitos da Reforma Tributária no negócio e antecipe decisões sobre preço, crédito, margem e estrutura."
                actionLabel="Simular reforma"
                actionTo="/app/diagnostico/novo"
                status="Nova projeção"
                support="Informe as premissas para projetar impactos e oportunidades."
              >
                <MetricRow label="Carga atual" value="—" />
                <MetricRow label="Carga projetada" value="—" />
                <MetricRow label="Créditos estimados" value="—" />
                <MetricRow label="Pressão sobre margem" value="—" />
                <MetricRow label="Impacto anual" value="—" emphasis />
              </StrategicModule>
            </section>

            <section className="relative mt-4 overflow-hidden rounded-2xl border border-[#d9e1dd] bg-white shadow-[0_12px_35px_rgba(15,45,40,.07)]">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-[#0b6a60]" />
              <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-[#cfe0da] bg-[#eff6f3] text-[#0b665d]">
                    <Target className="h-7 w-7" />
                  </span>
                  <div>
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#907137]">
                      <Sparkles className="h-3.5 w-3.5" />
                      Visão integrada
                    </div>
                    <h2 className="font-serif text-2xl font-semibold tracking-[-0.02em] text-[#17302e]">
                      Novo Diagnóstico Estratégico
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-[#60716b]">
                      Combina empresa + passivo + reforma + riscos + oportunidades + estratégia.
                    </p>
                  </div>
                </div>

                <Link
                  to="/app/diagnostico/novo"
                  className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-xl bg-[#075d55] px-6 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-lg shadow-[#075d55]/15 transition hover:-translate-y-0.5 hover:bg-[#064f49]"
                >
                  Iniciar diagnóstico completo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            <section className="mt-7">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#92723a]">
                    <FileSearch className="h-3.5 w-3.5" />
                    Monitoramento oficial
                  </div>
                  <h2 className="font-serif text-3xl font-semibold tracking-[-0.02em] text-[#17302e]">
                    Fique ligado nas decisões
                  </h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#677771]">
                    Atualizações estratégicas publicadas por órgãos públicos para acompanhar impactos e oportunidades.
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#667873]">
                  <ShieldCheck className="h-4 w-4 text-[#0b6a60]" />
                  Acesso direto às fontes oficiais
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {OFFICIAL_SOURCES.map((source) => (
                  <SourceCard key={source.name} {...source} />
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function StrategicModule({
  tone,
  icon: Icon,
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
  status,
  support,
  children,
}: {
  tone: "passivo" | "reforma";
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
  status: string;
  support: string;
  children: ReactNode;
}) {
  const palette =
    tone === "passivo"
      ? {
          shell:
            "bg-[radial-gradient(circle_at_82%_14%,rgba(33,152,130,.20),transparent_34%),radial-gradient(circle_at_10%_100%,rgba(20,91,83,.34),transparent_45%),linear-gradient(145deg,#032b2d_0%,#063c39_58%,#052f32_100%)]",
          accent: "text-[#d9b56b]",
          icon: "border-[#d9b56b]/48 bg-[#d9b56b]/8 text-[#e4c77f]",
          button: "bg-[#0b7a6e] hover:bg-[#096b61] shadow-[#021d1d]/35",
          glow: "bg-[#1bc4a7]/12",
        }
      : {
          shell:
            "bg-[radial-gradient(circle_at_80%_12%,rgba(45,130,183,.22),transparent_34%),radial-gradient(circle_at_6%_100%,rgba(24,94,118,.34),transparent_45%),linear-gradient(145deg,#062d38_0%,#073f52_58%,#062e3b_100%)]",
          accent: "text-[#d9b56b]",
          icon: "border-[#d9b56b]/48 bg-[#d9b56b]/8 text-[#e4c77f]",
          button: "bg-[#176d96] hover:bg-[#145f84] shadow-[#031c26]/35",
          glow: "bg-[#45a9dc]/12",
        };

  return (
    <article
      className={`group relative min-h-[500px] overflow-hidden rounded-2xl border border-white/10 text-white shadow-[0_22px_50px_rgba(4,35,33,.18)] ${palette.shell}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className={`pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full blur-3xl ${palette.glow}`} />

      <div className="relative flex min-h-[500px] flex-col p-5 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex min-w-0 items-start gap-4">
            <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border ${palette.icon}`}>
              <Icon className="h-7 w-7" strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${palette.accent}`}>{eyebrow}</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold tracking-[-0.025em]">{title}</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/66">{description}</p>
            </div>
          </div>
        </div>

        <div className="grid flex-1 gap-5 py-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="rounded-2xl border border-white/10 bg-black/10 px-4 sm:px-5">
            {children}
          </div>

          <div className="flex min-h-[220px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-sm">
            <div>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.055] text-white/72">
                {tone === "passivo" ? <BarChart3 className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
              </div>
              <p className="text-sm font-semibold text-white/92">{status}</p>
              <p className="mt-2 text-xs leading-5 text-white/48">{support}</p>
            </div>

            <div className="mt-7 border-t border-white/10 pt-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/38">Próxima leitura</p>
              <p className="mt-2 text-xs leading-5 text-white/66">
                Resultado baseado somente em dados efetivamente informados e validados.
              </p>
            </div>
          </div>
        </div>

        <Link
          to={actionTo}
          className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl px-5 text-xs font-bold uppercase tracking-[0.1em] text-white shadow-lg transition hover:-translate-y-0.5 ${palette.button}`}
        >
          {actionLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

function MetricRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex min-h-[57px] items-center justify-between gap-4 border-b border-white/10 py-3 last:border-b-0">
      <span className="text-xs text-white/62">{label}</span>
      <strong className={emphasis ? "text-lg font-semibold text-[#68ddbd]" : "text-base font-semibold text-white/88"}>
        {value}
      </strong>
    </div>
  );
}

function SourceCard({ name, subject, description, href, icon: Icon }: OfficialSource) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex min-h-[230px] flex-col rounded-2xl border border-[#dde5e1] bg-white p-5 shadow-[0_10px_28px_rgba(18,54,48,.055)] transition duration-200 hover:-translate-y-1 hover:border-[#cbd9d3] hover:shadow-[0_18px_38px_rgba(18,54,48,.09)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#d8e4df] bg-[#f1f6f4] text-[#0b665d]">
          <Icon className="h-6 w-6" strokeWidth={1.7} />
        </span>
        <span className="rounded-full border border-[#dbe5e0] bg-[#f8faf9] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#668079]">
          Fonte oficial
        </span>
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9a783d]">{subject}</p>
      <h3 className="mt-2 font-serif text-xl font-semibold text-[#17302e]">{name}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-[#657670]">{description}</p>

      <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-[#0b665d]">
        Ver atualizações
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </a>
  );
}

function SideLink({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className={`grid h-11 w-11 place-items-center rounded-xl transition ${
        active
          ? "bg-[#0b7168] text-white shadow-lg shadow-black/15"
          : "text-white/58 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5" />
    </Link>
  );
}

function formatRole(role: string | undefined) {
  if (!role) return "Sessão ativa";

  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
