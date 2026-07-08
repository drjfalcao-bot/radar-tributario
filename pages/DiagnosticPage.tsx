import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AssumptionsFooter } from "@/components/AssumptionsFooter";
import { ResultPanel } from "@/components/ResultPanel";
import { loadDiagnostic, type SavedDiagnostic } from "@/lib/storage";

export function DiagnosticPage({ readOnly = false }: { readOnly?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState<SavedDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadDiagnostic(id)
      .then(setRecord)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageShell>Carregando diagnostico...</PageShell>;
  if (!record) return <PageShell>Diagnostico nao encontrado.</PageShell>;

  return (
    <main className="min-h-screen bg-[#f7faf8]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link to="/" className="text-sm font-semibold text-petroleum-700 hover:underline">
            Novo diagnostico
          </Link>
          <Link to={`/share/${record.id}`} className="text-sm font-semibold text-petroleum-700 hover:underline">
            Link compartilhavel
          </Link>
        </div>
        <ResultPanel
          input={record.input}
          result={record.result}
          readOnly={readOnly}
          onPrint={() => navigate(`/print/${record.id}`)}
          onPro={() => navigate(`/app/leads/${record.id}`)}
          onNew={() => navigate("/")}
        />
        <AssumptionsFooter />
      </div>
    </main>
  );
}

function PageShell({ children }: { children: string }) {
  return <div className="min-h-screen bg-[#f7faf8] p-8 text-sm text-neutral-600">{children}</div>;
}
