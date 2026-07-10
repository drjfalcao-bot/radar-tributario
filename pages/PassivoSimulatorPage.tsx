import { useEffect, useMemo, useState, type LucideIcon, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clipboard,
  FileDown,
  FileSearch,
  Landmark,
  LayoutDashboard,
  LockKeyhole,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { formatCurrency } from "@/lib/RiskCalculator";
import {
  buildPassivoSummary,
  calculatePassivoSimulation,
  createDefaultPassivoInput,
  DEBT_NATURES,
  PASSIVO_RULES,
  type CapagClass,
  type CompanySize,
  type DebtNatureKey,
  type NatureParameters,
  type PassivoSimulatorInput,
  type RfbSituation,
  type SimulatorMode,
  type YesNoUnknown,
} from "@/lib/passivoSimulator";

type SimulatorSeed = {
  companyName?: string;
  cnpj?: string;
  companySize?: CompanySize;
  capag?: CapagClass;
  impediment?: YesNoUnknown;
  executionActive?: YesNoUnknown;
  seizureIdentified?: YesNoUnknown;
  rfbAmount?: number;
  rfbSituation?: RfbSituation;
  pgfnAmounts?: Partial<Record<DebtNatureKey, number>>;
};

type NatureStatus = "em_aberto" | "parcelado" | "garantido" | "suspenso";
const STATUS_LABELS: Record<NatureStatus, string> = { em_aberto: "Em aberto", parcelado: "Parcelamento atual", garantido: "Garantido", suspenso: "Suspenso" };

export function PassivoSimulatorPage() {
  const location = useLocation();
  const [input, setInput] = useState<PassivoSimulatorInput>(() => createDefaultPassivoInput());
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [manualModeOpen, setManualModeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [natureStatus, setNatureStatus] = useState<Record<DebtNatureKey, NatureStatus>>({ simples: "em_aberto", previdenciaria: "em_aberto", tributaria: "em_aberto", demais: "em_aberto" });

  useEffect(() => {
    const seed = (location.state as { seed?: SimulatorSeed } | null)?.seed;
    if (!seed) return;
    setInput((current) => ({
      ...current,
      companyName: seed.companyName ?? current.companyName,
      cnpj: seed.cnpj ?? current.cnpj,
      companySize: seed.companySize ?? current.companySize,
      capag: seed.capag ?? current.capag,
      impediment: seed.impediment ?? current.impediment,
      executionActive: seed.executionActive ?? current.executionActive,
      seizureIdentified: seed.seizureIdentified ?? current.seizureIdentified,
      rfbAmount: seed.rfbAmount ?? current.rfbAmount,
      rfbSituation: seed.rfbSituation ?? current.rfbSituation,
      pgfn: DEBT_NATURES.reduce((acc, nature) => ({ ...acc, [nature.key]: { ...current.pgfn[nature.key], amount: seed.pgfnAmounts?.[nature.key] ?? current.pgfn[nature.key].amount } }), current.pgfn),
    }));
  }, [location.state]);

  const result = useMemo(() => calculatePassivoSimulation(input), [input]);

  function update<K extends keyof PassivoSimulatorInput>(key: K, value: PassivoSimulatorInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function updateNature(key: DebtNatureKey, updates: Partial<NatureParameters>) {
    setInput((current) => ({ ...current, advancedOverrides: true, pgfn: { ...current.pgfn, [key]: { ...current.pgfn[key], ...updates } } }));
  }

  function selectMode(mode: SimulatorMode) {
    update("mode", mode);
    setManualModeOpen(mode !== "automatico");
  }

  function copySummary() {
    navigator.clipboard?.writeText(buildPassivoSummary(result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f6] text-[#102524] print:bg-white">
      <div className="grid min-h-screen lg:grid-cols-[64px_1fr] print:block">
        <aside className="border-r border-white/10 bg-[#062c2e] text-white print:hidden">
          <div className="flex items-center justify-between px-3 py-4 lg:min-h-screen lg:flex-col lg:py-5">
            <div className="flex items-center gap-2 lg:flex-col lg:gap-5">
              <Link to="/app/inicio"><BrandMark /></Link>
              <nav className="flex gap-2 lg:flex-col"><MiniNav to="/app/inicio" icon={LayoutDashboard} label="Início" /><MiniNav to="/app/pro" icon={Building2} label="Área Pro" /><MiniNav to="/app/simulador-passivo" icon={Calculator} label="Simulador" active /></nav>
            </div>
            <MiniNav to="/admin/usuarios" icon={Settings} label="Configurações" />
          </div>
        </aside>

        <section className="min-w-0">
          <header className="bg-[linear-gradient(90deg,#062c2e,#07383a)] px-4 py-4 text-white print:bg-white print:text-black sm:px-6">
            <div className="mx-auto flex max-w-[1780px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4"><BrandMark size="lg" /><div><div className="flex items-center gap-3"><Link to="/app/inicio" className="print:hidden"><ArrowLeft className="h-5 w-5 text-white/65" /></Link><h1 className="text-2xl font-semibold md:text-3xl">Simulador Estratégico de Passivo</h1></div><p className="mt-1 text-sm text-white/65 print:text-black">Radar Tributário V3 • PGFN / RFB</p></div></div>
              <div className="grid gap-2 md:grid-cols-4 xl:min-w-[820px]">
                <HeaderField label="Empresa"><input value={input.companyName} onChange={(event) => update("companyName", event.target.value)} placeholder="Razão social" className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder:text-white/35 print:text-black" /></HeaderField>
                <HeaderField label="CNPJ"><input value={input.cnpj} onChange={(event) => update("cnpj", event.target.value)} placeholder="00.000.000/0001-00" className="w-full bg-transparent text-xs font-semibold text-white outline-none placeholder:text-white/35 print:text-black" /></HeaderField>
                <HeaderField label="Porte"><select value={input.companySize} onChange={(event) => update("companySize", event.target.value as CompanySize)} className="w-full bg-transparent text-xs font-semibold text-white outline-none [color-scheme:dark] print:text-black"><option value="mei">MEI</option><option value="me">ME</option><option value="epp">EPP</option><option value="demais">Demais</option></select></HeaderField>
                <HeaderField label="CAPAG"><select value={input.capag} onChange={(event) => update("capag", event.target.value as CapagClass)} className="w-full bg-transparent text-xs font-semibold text-white outline-none [color-scheme:dark] print:text-black"><option value="nao_informada">Não informada</option><option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option></select></HeaderField>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1780px] px-3 py-3 sm:px-5">
            <section className="grid gap-3 xl:grid-cols-[1.25fr_.9fr]">
              <Card>
                <div className="mb-3 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-[#17302e]">Dívidas PGFN por natureza</h2><p className="mt-1 text-xs text-[#70817b]">Fluxo do simulador original, com cálculo separado por natureza.</p></div><span className="rounded-full bg-[#eef5f2] px-3 py-1 text-[10px] font-bold text-[#0b6a60]">PGFN {formatCurrency(result.pgfnTotal)}</span></div>
                <div className="divide-y divide-[#edf1ef]">{DEBT_NATURES.map((nature) => <div key={nature.key} className="grid gap-3 py-3 md:grid-cols-[42px_1fr_190px_180px_74px] md:items-center"><span className="grid h-9 w-9 place-items-center rounded-lg border border-[#c9d7d1] bg-[#f7faf8] text-[#0b6158]"><Landmark className="h-4 w-4" /></span><span><strong className="block text-sm text-[#263d38]">{nature.label}</strong><small className="text-[10px] text-[#7c8b85]">Valor consolidado</small></span><MoneyBox value={input.pgfn[nature.key].amount} onChange={(value) => updateNature(nature.key, { amount: value })} /><select value={natureStatus[nature.key]} onChange={(event) => setNatureStatus((current) => ({ ...current, [nature.key]: event.target.value as NatureStatus }))} className="min-h-10 rounded-lg border border-[#d7e0dc] bg-white px-3 text-xs text-[#405550] outline-none">{Object.entries(STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={() => setAdvancedOpen(true)} className="inline-flex items-center justify-end gap-1 text-xs font-semibold text-[#61736d]">Detalhes <ChevronDown className="h-4 w-4" /></button></div>)}</div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-[#17302e]">Receita Federal</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2"><label className="grid gap-1.5 text-xs font-semibold text-[#405550]">Valor consolidado<MoneyBox value={input.rfbAmount} onChange={(value) => update("rfbAmount", value)} /></label><label className="grid gap-1.5 text-xs font-semibold text-[#405550]">Situação atual<select value={input.rfbSituation} onChange={(event) => update("rfbSituation", event.target.value as RfbSituation)} className="min-h-11 rounded-lg border border-[#d7e0dc] bg-white px-3 text-sm text-[#304640] outline-none"><option value="inicial">Parcelamento inicial</option><option value="primeiro_reparcelamento">Primeiro reparcelamento</option><option value="reparcelamento_anterior">Já houve reparcelamento anterior</option><option value="nao_sei">Não sei</option></select></label></div>
                <div className="mt-5 rounded-xl border border-[#dbe7e1] bg-[#f7faf8] p-4"><p className="flex gap-2 text-xs leading-5 text-[#526660]"><CircleDollarSign className="mt-0.5 h-4 w-4 shrink-0 text-[#0b6a60]" />A RFB é calculada à parte e não compõe os totais de redução da PGFN.</p><div className="mt-4 grid grid-cols-3 gap-2"><MiniStat label="Primeira prestação" value={result.rfb.firstInstallment ? formatCurrency(result.rfb.firstInstallment) : "—"} /><MiniStat label="Parcelas" value={result.rfb.totalInstallments ? `${result.rfb.totalInstallments}x` : "—"} /><MiniStat label="Parcela do saldo" value={result.rfb.balanceInstallmentValue ? formatCurrency(result.rfb.balanceInstallmentValue) : "—"} /></div><p className="mt-4 text-[10px] leading-4 text-[#61736d]">{result.rfb.note}</p></div>
              </Card>
            </section>

            <section className="mt-3 grid gap-3 xl:grid-cols-[1.25fr_.75fr]">
              <div className="grid gap-2 sm:grid-cols-3"><ModeButton active={input.mode === "automatico"} icon={Sparkles} title="Identificar automaticamente" subtitle="Recomendado" onClick={() => selectMode("automatico")} /><ModeButton active={input.mode !== "automatico"} icon={ShieldCheck} title="Selecionar manualmente" subtitle={input.mode === "automatico" ? "Escolher modalidade" : modeLabel(input.mode)} onClick={() => setManualModeOpen((value) => !value)} /><ModeButton active={advancedOpen} icon={SlidersHorizontal} title="Parâmetros avançados" subtitle="Base, desconto e prazos" onClick={() => setAdvancedOpen((value) => !value)} /></div>
              <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-[#e0e5e2] bg-white shadow-sm"><Risk label="Impedimento" value={input.impediment} onChange={(value) => update("impediment", value)} /><Risk label="Execução" value={input.executionActive} onChange={(value) => update("executionActive", value)} /><Risk label="Penhora" value={input.seizureIdentified} onChange={(value) => update("seizureIdentified", value)} /></div>
            </section>

            {manualModeOpen ? <section className="mt-2 flex flex-wrap gap-2 rounded-xl border border-[#dce5e0] bg-white p-3 shadow-sm"><ModeChoice label="CAPAG" active={input.mode === "capag"} onClick={() => selectMode("capag")} /><ModeChoice label="TIS" active={input.mode === "tis"} onClick={() => selectMode("tis")} /><ModeChoice label="Parcelamento ordinário" active={input.mode === "ordinario"} onClick={() => selectMode("ordinario")} /><ModeChoice label="Negociação individual" active={input.mode === "individual"} onClick={() => selectMode("individual")} /></section> : null}

            {advancedOpen ? <Advanced input={input} update={update} updateNature={updateNature} /> : null}

            <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Dívida Original" value={formatCurrency(result.pgfnTotal)} detail="100%" icon={FileSearch} /><Metric label="Redução" value={formatCurrency(result.attainableScenario.reduction)} detail={`${result.attainableScenario.savingsPercent.toFixed(2).replace(".", ",")}%`} icon={Calculator} positive /><Metric label="Saldo" value={formatCurrency(result.attainableScenario.balance)} detail={`${Math.max(0, 100 - result.attainableScenario.savingsPercent).toFixed(2).replace(".", ",")}%`} icon={WalletCards} /><Metric label="Potencial de Economia" value={formatCurrency(result.potentialSavings)} detail={`${result.potentialSavingsPercent.toFixed(2).replace(".", ",")}% do original`} icon={CircleDollarSign} positive outlined /></section>

            <section className="mt-3 grid gap-3 xl:grid-cols-[1.55fr_.65fr]">
              <article className="overflow-hidden rounded-xl border border-[#e0e5e2] bg-white shadow-sm"><div className="flex items-center justify-between border-b border-[#e8ecea] px-4 py-3"><div><h2 className="text-sm font-semibold text-[#17302e]">Resumo por natureza (PGFN)</h2><p className="mt-0.5 text-[10px] text-[#7b8a85]">Redução aplicada somente sobre a base redutível estimada.</p></div><span className="rounded-full bg-[#edf4f1] px-3 py-1 text-[10px] font-bold text-[#0b6a60]">{result.resolvedModeLabel}</span></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-[#f7f9f8] text-[10px] uppercase tracking-wide text-[#6f807a]"><tr><th className="px-4 py-3">Natureza</th><th className="px-3 py-3">Original</th><th className="px-3 py-3">Base redutível</th><th className="px-3 py-3">Redução</th><th className="px-3 py-3">Entrada</th><th className="px-3 py-3">Saldo</th><th className="px-3 py-3">Plano</th></tr></thead><tbody className="divide-y divide-[#edf1ef]">{result.attainableScenario.natureResults.map((item) => <tr key={item.key}><td className="px-4 py-3 font-semibold text-[#233a35]">{item.label}</td><td className="px-3 py-3">{formatCurrency(item.original)}</td><td className="px-3 py-3">{formatCurrency(item.reducibleBase)}</td><td className="px-3 py-3 font-semibold text-[#13805f]">{formatCurrency(item.reduction)}<small className="block">{item.discountPercent.toFixed(1)}%</small></td><td className="px-3 py-3">{formatCurrency(item.entryTotal)}{item.entryInstallments ? <small className="block text-[#81908b]">{item.entryInstallments}x de {formatCurrency(item.entryInstallmentValue)}</small> : null}</td><td className="px-3 py-3 font-semibold">{formatCurrency(item.balance)}</td><td className="px-3 py-3">{item.totalMonths || "—"} meses<small className="block text-[#81908b]">{item.balanceMonths ? `${item.balanceMonths}x de ${formatCurrency(item.balanceInstallmentValue)}` : "—"}</small></td></tr>)}</tbody></table></div></article>
              <Card><h2 className="text-sm font-semibold text-[#17302e]">Receita Federal <span className="font-normal text-[#7a8984]">(separado)</span></h2><dl className="mt-3 divide-y divide-[#edf1ef] text-xs"><Summary label="Valor original" value={formatCurrency(result.rfb.original)} /><Summary label="Primeira prestação" value={result.rfb.firstInstallment ? formatCurrency(result.rfb.firstInstallment) : "—"} /><Summary label="Percentual especial" value={result.rfb.firstInstallmentPercent ? `${result.rfb.firstInstallmentPercent}%` : "Não aplicável"} /><Summary label="Saldo" value={formatCurrency(result.rfb.balance)} /><Summary label="Parcelas do saldo" value={result.rfb.balanceInstallments ? `${result.rfb.balanceInstallments}x de ${formatCurrency(result.rfb.balanceInstallmentValue)}` : "—"} /></dl></Card>
            </section>

            <section className="mt-3 grid gap-3 xl:grid-cols-[1.25fr_.75fr]">
              <Card><h2 className="text-sm font-semibold text-[#17302e]">Comparativo de cenários (PGFN)</h2><div className="mt-3 grid gap-3 md:grid-cols-2"><Scenario title="Cenário atual" subtitle="Regularização sem redução automática" scenario={result.currentScenario} /><Scenario title="Cenário atingível" subtitle={result.resolvedModeLabel} scenario={result.attainableScenario} success /></div></Card>
              <article className={`rounded-xl border p-4 shadow-sm ${result.requiresTwoStepStrategy ? "border-[#efcc9d] bg-[#fffaf3]" : "border-[#dce5e0] bg-white"}`}><div className="flex gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0d9] text-[#c47b18]"><Target className="h-5 w-5" /></span><div><h2 className="text-sm font-semibold text-[#a66212]">Estratégia em duas etapas</h2><p className="mt-1 text-[10px] leading-4 text-[#6b7874]">{result.requiresTwoStepStrategy ? "Indicada para impedimento, CAPAG atual sem redução ou necessidade de revisão." : "Disponível para organizar regularização e otimização."}</p></div></div><div className="mt-4 grid gap-3"><Step number="1" title="Regularização e estabilização" text="Usar a modalidade disponível, documentar adimplência e reduzir risco imediato." /><Step number="2" title="Revisão e otimização" text="Analisar impedimento, CAPAG, elegibilidade e cenário potencial." /></div></article>
            </section>

            <section className="mt-3 rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm"><div className="grid gap-5 xl:grid-cols-2"><div><div className="flex items-center gap-2"><h2 className="text-sm font-semibold text-[#17302e]">Transação Individual Simplificada (TIS)</h2><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${result.tis.valueRangeEligible ? "bg-[#e6f4ec] text-[#17735a]" : "bg-[#f3f3f3] text-[#6d7d77]"}`}>{result.tis.statusLabel}</span></div><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><MiniStat label="Faixa" value="> R$ 1 mi e < R$ 10 mi" /><MiniStat label="Entrada" value="6%" /><MiniStat label="Parcelamento" value="12x editável" /><MiniStat label="Prazo base" value="60 meses" /></div><p className="mt-3 text-[10px] leading-4 text-[#6d7d77]">{result.tis.note}</p></div><div className="border-t border-[#e8ecea] pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-[#17302e]">Garantia <span className="font-normal text-[#7a8984]">(separada da redução)</span></h2><LockKeyhole className="h-4 w-4 text-[#0b6a60]" /></div><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><MiniStat label="Cobertura" value={formatCurrency(result.guarantee.suggestedCoverage)} /><MiniStat label="Custo anual" value={`${result.guarantee.annualCostPercent.toFixed(2).replace(".", ",")}%`} /><MiniStat label="Valor anual" value={formatCurrency(result.guarantee.estimatedAnnualCost)} /><MiniStat label="Natureza" value="Estratégia autônoma" /></div><p className="mt-3 text-[10px] leading-4 text-[#6d7d77]">{result.guarantee.note}</p></div></div></section>

            <section className="mt-3 grid gap-3 xl:grid-cols-[1fr_auto]"><div className="rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm"><h2 className="flex items-center gap-2 text-sm font-semibold text-[#17302e]"><AlertTriangle className="h-4 w-4 text-[#d18a2b]" /> Alertas e premissas</h2><ul className="mt-3 grid gap-2 md:grid-cols-2">{result.alerts.map((alert, index) => <li key={`${alert}-${index}`} className="rounded-lg bg-[#f8faf9] p-3 text-[10px] leading-4 text-[#61736d]">{alert}</li>)}</ul></div><div className="flex flex-wrap content-start gap-2 print:hidden"><button type="button" onClick={copySummary} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#cddbd4] bg-white px-4 text-xs font-bold text-[#0b6a60]"><Clipboard className="h-4 w-4" /> {copied ? "Copiado" : "Copiar resumo"}</button><button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#073f3b] px-4 text-xs font-bold text-white"><FileDown className="h-4 w-4" /> Imprimir / PDF</button></div></section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ children }: { children: ReactNode }) { return <article className="rounded-xl border border-[#e0e5e2] bg-white p-4 shadow-sm">{children}</article>; }
function HeaderField({ label, children }: { label: string; children: ReactNode }) { return <label className="rounded-lg border border-white/14 bg-white/5 px-3 py-2"><span className="block text-[9px] font-bold uppercase tracking-wide text-white/55 print:text-black">{label}</span><span className="mt-1 block">{children}</span></label>; }
function MoneyBox({ value, onChange }: { value: number; onChange: (value: number) => void }) { return <span className="flex min-h-11 items-center rounded-lg border border-[#d7e0dc] bg-white px-3"><span className="mr-2 text-xs text-[#7d8b86]">R$</span><input type="number" min="0" step="0.01" value={value || ""} onChange={(event) => onChange(Number(event.target.value) || 0)} placeholder="0,00" className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#304640] outline-none" /></span>; }
function NumberBox({ value, onChange, integer = false }: { value: number; onChange: (value: number) => void; integer?: boolean }) { return <input type="number" min="0" step={integer ? "1" : "0.01"} value={value} onChange={(event) => onChange(integer ? Math.round(Number(event.target.value) || 0) : Number(event.target.value) || 0)} className="min-h-9 w-full rounded-lg border border-[#d7e0dc] bg-white px-3 text-xs text-[#304640] outline-none" />; }
function ModeButton({ active, icon: Icon, title, subtitle, onClick }: { active: boolean; icon: LucideIcon; title: string; subtitle: string; onClick: () => void }) { return <button type="button" onClick={onClick} className={`flex min-h-[58px] items-center gap-3 rounded-xl border px-4 text-left shadow-sm ${active ? "border-[#0b6a60] bg-[#07574f] text-white" : "border-[#dce5e0] bg-white text-[#304640]"}`}><span className={`grid h-9 w-9 place-items-center rounded-full ${active ? "bg-white/10" : "bg-[#f2f6f4] text-[#0b6a60]"}`}><Icon className="h-4 w-4" /></span><span><strong className="block text-xs">{title}</strong><small className={active ? "text-white/65" : "text-[#7c8b85]"}>{subtitle}</small></span></button>; }
function ModeChoice({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`rounded-lg border px-4 py-2 text-xs font-semibold ${active ? "border-[#0b6a60] bg-[#e8f3ef] text-[#0b6a60]" : "border-[#dce5e0] bg-white text-[#61736d]"}`}>{label}</button>; }
function Risk({ label, value, onChange }: { label: string; value: YesNoUnknown; onChange: (value: YesNoUnknown) => void }) { return <div className="border-r border-[#e7ebe9] p-3 text-center last:border-r-0"><p className="text-[10px] font-semibold text-[#61736d]">{label}</p><div className="mt-2 flex items-center justify-center gap-2"><button type="button" onClick={() => onChange(value === "sim" ? "nao" : "sim")} className={`relative h-5 w-9 rounded-full ${value === "sim" ? "bg-[#0b7c6d]" : "bg-[#ccd7d2]"}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow ${value === "sim" ? "left-[18px]" : "left-0.5"}`} /></button><span className="text-[10px] font-bold text-[#61736d]">{value === "sim" ? "Ativo" : value === "nao_sei" ? "Não sei" : "Não"}</span></div></div>; }
function Metric({ label, value, detail, icon: Icon, positive = false, outlined = false }: { label: string; value: string; detail: string; icon: LucideIcon; positive?: boolean; outlined?: boolean }) { return <article className={`rounded-xl bg-white p-4 shadow-sm ${outlined ? "border border-[#5c9f7f]" : "border border-[#e0e5e2]"}`}><div className="flex items-start justify-between"><div><p className="text-xs font-semibold text-[#536660]">{label}</p><p className={`mt-2 text-2xl font-semibold ${positive ? "text-[#13805f]" : "text-[#17302e]"}`}>{value}</p><p className={`mt-2 text-xs ${positive ? "font-semibold text-[#278064]" : "text-[#6f807a]"}`}>{detail}</p></div><span className={`grid h-11 w-11 place-items-center rounded-full ${positive ? "bg-[#eaf6f0] text-[#13805f]" : "bg-[#f4f6f5] text-[#526660]"}`}><Icon className="h-5 w-5" /></span></div></article>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div><p className="text-[9px] uppercase tracking-wide text-[#7c8b85]">{label}</p><p className="mt-1 text-xs font-semibold text-[#304640]">{value}</p></div>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-4 py-2.5"><dt className="text-[#61736d]">{label}</dt><dd className="text-right font-semibold text-[#304640]">{value}</dd></div>; }
function Step({ number, title, text }: { number: string; title: string; text: string }) { return <div className="grid grid-cols-[28px_1fr] gap-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-[#e1b879] bg-white text-xs font-bold text-[#b06b16]">{number}</span><div><p className="text-xs font-semibold text-[#405550]">{title}</p><p className="mt-1 text-[10px] leading-4 text-[#74837e]">{text}</p></div></div>; }
function Scenario({ title, subtitle, scenario, success = false }: { title: string; subtitle: string; scenario: ReturnType<typeof calculatePassivoSimulation>["currentScenario"]; success?: boolean }) { return <div className={`rounded-lg border p-4 ${success ? "border-[#c9e0d5] bg-[#f8fcfa]" : "border-[#ead8c1] bg-[#fffaf4]"}`}><div className="flex items-start justify-between"><div><h3 className={`text-sm font-semibold ${success ? "text-[#0c6d58]" : "text-[#8f5e20]"}`}>{title}</h3><p className="mt-1 text-[10px] text-[#74837e]">{subtitle}</p></div>{success ? <CheckCircle2 className="h-5 w-5 text-[#13805f]" /> : <ShieldAlert className="h-5 w-5 text-[#d08a2b]" />}</div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><MiniStat label="Entrada" value={formatCurrency(scenario.entryTotal)} /><MiniStat label="Prazo" value={scenario.balanceMonths ? `${scenario.balanceMonths} meses` : "—"} /><MiniStat label="Parcela média" value={scenario.averageBalanceInstallment ? formatCurrency(scenario.averageBalanceInstallment) : "—"} /><MiniStat label="Redução" value={formatCurrency(scenario.reduction)} /></div></div>; }
function Advanced({ input, update, updateNature }: { input: PassivoSimulatorInput; update: <K extends keyof PassivoSimulatorInput>(key: K, value: PassivoSimulatorInput[K]) => void; updateNature: (key: DebtNatureKey, updates: Partial<NatureParameters>) => void }) { return <section className="mt-2 rounded-xl border border-[#dce5e0] bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-[#17302e]">Parâmetros avançados por natureza</h2><p className="mt-1 text-[10px] text-[#74837e]">Ao editar, o sistema passa a usar os parâmetros personalizados.</p></div><label className="flex items-center gap-2 text-xs text-[#526660]"><input type="checkbox" checked={input.simulateStrategicReview} onChange={(event) => update("simulateStrategicReview", event.target.checked)} className="h-4 w-4 accent-[#0b6a60]" /> Simular revisão de CAPAG/impedimento</label></div><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead className="bg-[#f7f9f8] text-[10px] uppercase tracking-wide text-[#6f807a]"><tr><th className="px-3 py-2">Natureza</th><th className="px-3 py-2">Base redutível (%)</th><th className="px-3 py-2">Desconto (%)</th><th className="px-3 py-2">Entrada (%)</th><th className="px-3 py-2">Parcelas entrada</th><th className="px-3 py-2">Prazo total</th></tr></thead><tbody>{DEBT_NATURES.map((nature) => { const p = input.pgfn[nature.key]; return <tr key={nature.key} className="border-b border-[#edf1ef]"><td className="px-3 py-3 font-semibold">{nature.label}</td><td className="px-3 py-3"><NumberBox value={p.reducibleBasePercent} onChange={(value) => updateNature(nature.key, { reducibleBasePercent: value })} /></td><td className="px-3 py-3"><NumberBox value={p.discountPercent} onChange={(value) => updateNature(nature.key, { discountPercent: value })} /></td><td className="px-3 py-3"><NumberBox value={p.entryPercent} onChange={(value) => updateNature(nature.key, { entryPercent: value })} /></td><td className="px-3 py-3"><NumberBox value={p.entryInstallments} onChange={(value) => updateNature(nature.key, { entryInstallments: value })} integer /></td><td className="px-3 py-3"><NumberBox value={p.totalMonths} onChange={(value) => updateNature(nature.key, { totalMonths: value })} integer /></td></tr>; })}</tbody></table></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><label className="grid gap-1 text-xs font-semibold">Parcelas RFB<NumberBox value={input.rfbInstallments} onChange={(value) => update("rfbInstallments", value)} integer /></label><label className="grid gap-1 text-xs font-semibold">Custo anual da garantia (%)<NumberBox value={input.guaranteeAnnualCostPercent} onChange={(value) => update("guaranteeAnnualCostPercent", value)} /></label><div className="rounded-lg bg-[#f8faf9] p-3 text-[10px] leading-4 text-[#61736d]">Teto referencial de redução: {input.companySize === "demais" ? `${PASSIVO_RULES.pgfn.discountCapGeneral}%` : `${PASSIVO_RULES.pgfn.discountCapFavored}%`}. A redução efetiva também é limitada pela base redutível.</div></div></section>; }
function MiniNav({ to, icon: Icon, label, active = false }: { to: string; icon: LucideIcon; label: string; active?: boolean }) { return <Link to={to} title={label} aria-label={label} className={`grid h-10 w-10 place-items-center rounded-lg ${active ? "bg-[#0b7168] text-white" : "text-white/68 hover:bg-white/10"}`}><Icon className="h-5 w-5" /></Link>; }
function modeLabel(mode: SimulatorMode) { return ({ automatico: "Automático", capag: "CAPAG", tis: "TIS", ordinario: "Ordinário", individual: "Individual" } as Record<SimulatorMode, string>)[mode]; }
