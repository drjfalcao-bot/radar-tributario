import { PREMISSAS } from "@/lib/premissas";

export function AssumptionsFooter() {
  return (
    <footer className="mt-8 border-t border-neutral-200 pt-5 text-xs text-neutral-500 print:mt-6">
      <p className="font-semibold text-neutral-700">Fontes e premissas tecnicas</p>
      <ul className="mt-2 space-y-1">
        {PREMISSAS.fontes.map((fonte) => (
          <li key={fonte.url}>
            {fonte.nome}:{" "}
            <a href={fonte.url} target="_blank" rel="noreferrer" className="text-petroleum-700 underline">
              {fonte.url}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3">
        Versao das premissas: {PREMISSAS.versao}. Estimativa preliminar com dados informados verbalmente; nao substitui
        analise documental, fiscal ou juridica.
      </p>
    </footer>
  );
}
