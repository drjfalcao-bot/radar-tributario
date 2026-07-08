import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, ShieldAlert } from "lucide-react";
import {
  listLeadDocuments,
  loadDiagnostic,
  saveLeadDocument,
  type LeadDocument,
  type LeadDocumentStatus,
  type SavedDiagnostic,
} from "@/lib/storage";
import { ProShell } from "@/pages/LeadsPage";

export function DocumentosPage() {
  const { id } = useParams();
  const [record, setRecord] = useState<SavedDiagnostic | null>(null);
  const [documents, setDocuments] = useState<LeadDocument[]>([]);

  useEffect(() => {
    if (!id) return;
    loadDiagnostic(id, true).then(async (data) => {
      setRecord(data);
      if (data) {
        setDocuments(await listLeadDocuments(data.id, data.result.documentos));
      }
    });
  }, [id]);

  async function updateDocument(doc: LeadDocument, patch: Partial<LeadDocument>) {
    const next = { ...doc, ...patch };
    setDocuments((items) => items.map((item) => (item.nome === doc.nome ? next : item)));
    await saveLeadDocument(next);
  }

  if (!record) return <ProShell title="Documentos">Carregando documentos...</ProShell>;

  return (
    <ProShell title={`Documentos - ${record.input.nomeEmpresa}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link to={`/app/leads/${record.id}`} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm font-semibold text-neutral-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o lead
        </Link>
      </div>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-5 w-5 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Envio de documentos por e-mail</p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Esta tela nao faz upload de arquivos. Use o checklist para controlar o que foi pedido, recebido e validado.
              Os documentos devem ser enviados por e-mail ao escritorio ou ao responsavel combinado com o cliente.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-start gap-3 rounded-md bg-[#f7faf8] p-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 text-petroleum-700" />
          <p className="text-sm text-neutral-600">
            Marque o status de cada documento e registre no campo de observacao quem enviou, quando enviou ou o que ainda falta.
          </p>
        </div>
        <div className="grid gap-3">
          {documents.map((doc) => (
            <label key={doc.nome} className="grid gap-2 rounded-md border border-neutral-200 p-3 md:grid-cols-[1fr_190px] md:items-center">
              <span className="text-sm font-medium text-neutral-800">{doc.nome}</span>
              <select
                value={doc.status}
                onChange={(event) => updateDocument(doc, { status: event.target.value as LeadDocumentStatus })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="pendente">pendente</option>
                <option value="validado">validado</option>
                <option value="nao_aplicavel">nao aplicavel</option>
              </select>
              <input
                value={doc.observacao ?? ""}
                onChange={(event) => updateDocument(doc, { observacao: event.target.value })}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm md:col-span-2"
                placeholder="Observacao, link ou responsavel pelo envio"
              />
            </label>
          ))}
        </div>
      </div>
    </ProShell>
  );
}
