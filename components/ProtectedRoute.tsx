import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentAuthorizedUser } from "@/lib/storage";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type State = "checking" | "allowed" | "login" | "pending";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(isSupabaseConfigured ? "checking" : "allowed");

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    async function checkAccess() {
      const { data } = await supabase!.auth.getSession();
      if (!data.session) {
        setState("login");
        return;
      }
      const user = await getCurrentAuthorizedUser();
      setState(user?.status === "ativo" ? "allowed" : "pending");
    }

    checkAccess().catch(() => setState("pending"));
  }, []);

  if (state === "checking") {
    return <div className="p-8 text-sm text-neutral-500">Verificando acesso...</div>;
  }
  if (state === "login") return <Navigate to="/login" replace />;
  if (state === "pending") return <Navigate to="/acesso-pendente" replace />;

  return <>{children}</>;
}
