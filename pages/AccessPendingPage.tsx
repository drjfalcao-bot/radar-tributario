import { Link } from "react-router-dom";

export function AccessPendingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7faf8] px-4">
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-panel">
        <p className="text-sm font-semibold text-petroleum-700">Acesso recebido</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Autorizacao pendente</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Seu login foi identificado, mas o administrador ainda precisa liberar este e-mail na Area Pro.
        </p>
        <Link to="/" className="mt-5 inline-block text-sm font-semibold text-petroleum-700 hover:underline">
          Voltar ao radar
        </Link>
      </section>
    </main>
  );
}
