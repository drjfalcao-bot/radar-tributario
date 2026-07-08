import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, CalendarClock, FileText, Landmark, LineChart, ShieldCheck } from "lucide-react";
import { AssumptionsFooter } from "@/components/AssumptionsFooter";
import { RadarForm } from "@/components/RadarForm";
import { ResultPanel } from "@/components/ResultPanel";
import type { DiagnosticInput, DiagnosticResult } from "@/lib/RiskCalculator";
import { MOCK_SCENARIOS } from "@/lib/mockScenarios";
import { saveDiagnostic, type SavedDiagnostic } from "@/lib/storage";
import { daysUntil } from "@/lib/utils";

export function PublicRadarPage() {
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
  const [defaultInput, setDefaultInput] = useState<Partial<DiagnosticInput>>();
  const [input, setInput] = useState<DiagnosticInput | null>(null);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [saved, setSaved] = useState<SavedDiagnostic | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleScenario(id: string) {
    const scenario = MOCK_SCENARIOS.find((item) => item.id === id);
    if (!scenario) return;
    setDefaultInput(scenario.input);
    setFormKey((key) => key + 1);
    setInput(null);
    setResult(null);
    setSaved(null);
    setSaveError(null);
  }

  async function ensureSaved(): Promise<SavedDiagnostic | null> {
    if (saved) return saved;
    if (!input || !result) return null;

    setSaving(true);
    setSaveError(null);
    try {
      const record = await saveDiagnostic(input, result);
      setSaved(record);
      return record;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Nao foi possivel salvar o diagnostico.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function saveAndStay() {
    await ensureSaved();
  }

  async function goPrint() {
    const record = await ensureSaved();
    if (record) navigate(`/print/${record.id}`);
  }

  async function goPro() {
    const record = await ensureSaved();
    if (record) navigate(`/app/leads/${record.id}`);
  }

  function reset() {
    setDefaultInput(undefined);
    setInput(null);
    setResult(null);
    setSaved(null);
    setSaveError(null);
    setFormKey((key) => key + 1);
  }

  return (
    <main className="min-h-screen bg-[#eef3ef]">
      <section className="border-b border-[#173b37] bg-[#102524] text-white">
        <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
          <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#c9aa63]">
              <ShieldCheck size={18} />
              Radar Empresarial Tributario
            </div>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Diagnostico visual para reforma, caixa e passivo fiscal
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/72">
              Uma conducao objetiva para mapear porte, faturamento, setor, clientes PJ, preparo fiscal e debitos por esfera.
            </p>

            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              <RadarStep icon={Building2} label="Perfil" detail="porte e setor" />
              <RadarStep icon={LineChart} label="Receita" detail="margem e B2B" />
              <RadarStep icon={Landmark} label="Passivo" detail="Uniao, Estado, Municipio" />
              <RadarStep icon={FileText} label="Parecer" detail="score e roteiro" />
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-panel">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-0.5 text-[#c9aa63]" size={20} />
              <div>
                <p className="text-sm font-semibold text-white">Janela de setembro/2026</p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  Empresas do Simples: opcao de 1 a 30 de setembro de 2026 para regime regular de IBS/CBS em
                  jan-jun/2027.
                </p>
                <p className="mt-2 text-sm font-semibold text-[#c9aa63]">
                  {daysUntil("2026-09-01")} dias ate 01/09/2026
                </p>
              </div>
            </div>
          </div>
        </header>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 shadow-sm print:hidden">
          <span className="text-sm font-semibold text-ink">Cenario de demonstracao</span>
          <select
            onChange={(event) => handleScenario(event.target.value)}
            className="min-h-10 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="" disabled>
              Carregar exemplo
            </option>
            {MOCK_SCENARIOS.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
          <Link
            to="/app/leads"
            className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-300 px-3 text-sm font-semibold text-petroleum-800 hover:border-petroleum-700"
          >
            Area Pro
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="mt-6">
          <RadarForm
            key={formKey}
            defaultValues={defaultInput}
            onSubmit={(nextInput, nextResult) => {
              setInput(nextInput);
              setResult(nextResult);
              setSaved(null);
              setSaveError(null);
            }}
          />
        </section>

        {input && result && (
          <section className="mt-6">
            <ResultPanel
              input={input}
              result={result}
              onSave={saveAndStay}
              onPrint={goPrint}
              onPro={goPro}
              onNew={reset}
              actionState={saving ? "saving" : saved ? "saved" : "idle"}
            />
            {saveError && (
              <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {saveError}
              </p>
            )}
          </section>
        )}

        <AssumptionsFooter />
      </div>
    </main>
  );
}

function RadarStep({
  icon: Icon,
  label,
  detail,
}: {
  icon: typeof Building2;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.08] p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#c9aa63]" />
        <span className="text-sm font-semibold text-white">{label}</span>
      </div>
      <p className="mt-1 text-xs text-white/55">{detail}</p>
    </div>
  );
}
