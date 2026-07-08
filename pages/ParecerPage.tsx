import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  loadDiagnostic,
  updateDiagnosticMeta,
  type ParecerSection,
  type ParecerSectionStatus,
  type SavedDiagnostic,
} from "@/lib/storage";
import { ProShell } from "@/pages/LeadsPage";

export function ParecerPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<SavedDiagnostic | null>(null);

  useEffect(() => {
    if (!id) return;
    loadDiagnostic(id, true).then(setRecord);
  }, [id]);

  if (!record) return <ProShell title="Parecer">Carregando parecer...</ProShell>;

  return <ParecerEditor record={record} />;
}

function ParecerEditor({ record }: { record: SavedDiagnostic }) {
  const defaults = useMemo<ParecerSection[]>(
    () =>
      record.result.modulosParecer.map((titulo, index) => ({
        id: `${index}-${titulo.toLowerCase().replace(/\s+/g, "-")}`,
        titulo,
        texto: "",
        status: "pendente",
      })),
    [record.result.modulosParecer],
  );
  const [sections, setSections] = useState<ParecerSection[]>(record.parecer ?? defaults);
  const [saved, setSaved] = useState(false);

  async function save() {
    await updateDiagnosticMeta(record.id, { parecer: sections });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  function updateSection(id: string, patch: Partial<ParecerSection>) {
    setSections((items) => items.map((section) => (section.id === id ? { ...section, ...patch } : section)));
  }

  return (
    <ProShell title={`Parecer - ${record.input.nomeEmpresa}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link to={`/app/leads/${record.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o lead
        </Link>
      </div>
      <div className="mb-4 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
        Estrutura editavel para o especialista preencher depois da analise documental. O MVP nao gera parecer juridico automaticamente.
      </div>
      <div className="grid gap-4">
        {sections.map((section) => (
          <section key={section.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_180px] md:items-center">
              <h2 className="font-semibold text-ink">{section.titulo}</h2>
              <select
                value={section.status}
                onChange={(event) => updateSection(section.id, { status: event.target.value as ParecerSectionStatus })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="pendente">pendente</option>
                <option value="validado">validado</option>
                <option value="nao_aplicavel">nao aplicavel</option>
              </select>
            </div>
            <textarea
              value={section.texto}
              onChange={(event) => updateSection(section.id, { texto: event.target.value })}
              rows={6}
              className="mt-3 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Texto tecnico, evidencia documental e recomendacao..."
            />
          </section>
        ))}
      </div>
      <button type="button" onClick={save} className="mt-5 rounded-md bg-petroleum-700 px-4 py-2 text-sm font-semibold text-white">
        {saved ? "Parecer salvo" : "Salvar parecer"}
      </button>
    </ProShell>
  );
}
