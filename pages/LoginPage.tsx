import { Link } from "react-router-dom";
import { useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

function friendlyAuthError(raw?: string | null) {
  const message = raw ? decodeURIComponent(raw).replace(/\+/g, " ") : "";
  const lower = message.toLowerCase();

  if (lower.includes("provider") || lower.includes("oauth")) {
    return "Login Google ainda nao esta habilitado no Supabase.";
  }
  if (lower.includes("redirect") || lower.includes("url")) {
    return "A URL de retorno do app ainda nao esta liberada no Supabase.";
  }

  return message || "Nao foi possivel iniciar o login com Google.";
}

function readAuthErrorFromUrl() {
  const sources = [window.location.search, window.location.hash.replace(/^#/, "?")];

  for (const source of sources) {
    const params = new URLSearchParams(source);
    const error = params.get("error_description") ?? params.get("error");
    if (error) return friendlyAuthError(error);
  }

  return "";
}

export function LoginPage() {
  const [errorMessage, setErrorMessage] = useState(readAuthErrorFromUrl);

  async function loginGoogle() {
    if (!supabase) return;
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app/leads`,
      },
    });
    if (error) setErrorMessage(friendlyAuthError(error.message));
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7faf8] px-4">
      <section className="w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-panel">
        <p className="text-sm font-semibold text-petroleum-700">Area Pro</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Entrar com Google</h1>
        <p className="mt-3 text-sm text-neutral-600">
          O Google valida a identidade, mas o acesso so e liberado para e-mails ativos na whitelist.
        </p>

        {isSupabaseConfigured ? (
          <>
            {errorMessage ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
            <button
              type="button"
              onClick={loginGoogle}
              className="mt-5 w-full rounded-md bg-petroleum-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-petroleum-900"
            >
              Continuar com Google
            </button>
          </>
        ) : (
          <div className="mt-5 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
            Supabase ainda nao configurado. O MVP roda em modo local e a Area Pro fica aberta para testes.
          </div>
        )}

        <Link to="/app/leads" className="mt-4 block text-sm font-semibold text-petroleum-700 hover:underline">
          Abrir Area Pro
        </Link>
      </section>
    </main>
  );
}
